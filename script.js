// 1. DATA SETUP
const teacherData = [
    { name: "Mithila Mam", code: "2001" }, { name: "Naushina Mam", code: "2002" },
    { name: "Grishma Mam", code: "2003" }, { name: "Yogita Mam", code: "2004" },
    { name: "Sneha Mam", code: "2005" }, { name: "Seema Mam", code: "2006" },
    { name: "Shobna Mam", code: "2007" }, { name: "Serena Mam", code: "2008" },
    { name: "Quincy Mam", code: "2009" }, { name: "Namrata Mam", code: "2010" },
    { name: "Saba Mam", code: "2011" }, { name: "Sunita Mam", code: "2012" },
    { name: "Aimen Mam", code: "2013" }, { name: "Brinda Mam", code: "2014" },
    { name: "Allwyn Sir", code: "2015" }
];

const teachers = teacherData.map(t => t.name);

const rawStudentData = [
    { name: "AADHIL A", code: "1001" }, { name: "NIVAAN AGARWALA", code: "1002" },
    { name: "VIRAJ AGGARWAL", code: "1003" }, { name: "PIYUSH BANDAL", code: "1004" },
    { name: "HARSHIV CHAMARIYA", code: "1005" }, { name: "SATYAM CHAUHAN", code: "1006" },
    { name: "Shourya Chavan", code: "1007" }, { name: "NIRGHA DAABKE", code: "1008" },
    { name: "AVIANA DADWAL", code: "1009" }, { name: "REVAAN DAS", code: "1010" },
    { name: "IRA DESAI", code: "1011" }, { name: "Anay Desai", code: "1012" },
    { name: "QIRAT DHANANI", code: "1013" }, { name: "RIVIKA DOSHI", code: "1014" },
    { name: "Daraius Fernandes", code: "1015" }, { name: "AKKSHAJ GAIKWAD", code: "1016" },
    { name: "Ruhaani Godhrawala", code: "1017" }, { name: "RUDRAKSH GUPTA", code: "1018" },
    { name: "AAVYA JAIN", code: "1019" }, { name: "KAIRA JAIN", code: "1020" },
    { name: "PRAROOP JHA", code: "1021" }, { name: "ELIORA KAMANI", code: "1022" },
    { name: "ANUSHKA KARANDIKAR", code: "1023" }, { name: "MARDAAN KHAN", code: "1024" },
    { name: "AYANSH KOCHGAVE", code: "1025" }, { name: "JAI KUMAR", code: "1026" },
    { name: "samyak Kumar", code: "1027" }, { name: "Sarvam Laturia", code: "1028" },
    { name: "JANAV MANIAR", code: "1029" }, { name: "Khrisha Meena", code: "1030" },
    { name: "VRIDDHI NAIK", code: "1031" }, { name: "ARJUN PANDIT", code: "1032" },
    { name: "DEVANSHI PARMAR", code: "1033" }, { name: "KYNA PATEL", code: "1034" },
    { name: "KASHAF PATHAN", code: "1035" }, { name: "SHLOK PATIL", code: "1036" },
    { name: "Swar Pednekar", code: "1037" }, { name: "AAROHI PEDNEKAR", code: "1038" },
    { name: "KYRA RAI", code: "1039" }, { name: "SWASTIK SAHU", code: "1040" },
    { name: "HAMZA SAYANI", code: "1041" }, { name: "MOHDUZAIR SHAIKH", code: "1042" },
    { name: "YASHIMA SIDDIQUI", code: "1043" }, { name: "DHRUV SOLANKI", code: "1044" },
    { name: "SRISHTI SWAMINATHAN", code: "1045" }, { name: "ANAYA THAKKER", code: "1046" },
    { name: "ANANYA YADAV", code: "1047" }
];

let students = rawStudentData.map((student, index) => {
    let grades = ["A+", "A", "B+", "B"];
    let randomGrade = grades[Math.floor(Math.random() * grades.length)];
    let randomAttendance = Math.floor(Math.random() * 15) + 85; 

    return {
        id: index,
        childName: student.name,
        parentName: "Parent of " + student.name,
        code: student.code,
        grade: "5th - " + randomGrade,
        attendance: randomAttendance + "%"
    };
});

// MULTI-TEACHER DATABASES
let queues = {};
let completedMeetings = {}; 
let teacherSeconds = {}; 

// Initialize empty lists first
teachers.forEach(teacher => {
    queues[teacher] = []; 
    completedMeetings[teacher] = [];
    teacherSeconds[teacher] = 0;
});

let currentStudent = null;
let currentTeacher = null;
let timerInterval;

// --- NEW MAGIC: LOCALSTORAGE SYNCING ---

function saveData() {
    localStorage.setItem('ptm_queues', JSON.stringify(queues));
    localStorage.setItem('ptm_completed', JSON.stringify(completedMeetings));
}

function loadData() {
    let savedQueues = localStorage.getItem('ptm_queues');
    if (savedQueues) {
        queues = JSON.parse(savedQueues);
    }
    let savedCompleted = localStorage.getItem('ptm_completed');
    if (savedCompleted) {
        completedMeetings = JSON.parse(savedCompleted);
    }
}

// This listens for updates from OTHER windows/tabs
window.addEventListener('storage', function(e) {
    loadData();
    // If the parent screen is visible, update it live!
    if (document.getElementById('parent-screen').classList.contains('active')) {
        renderTeacherCheckboxes();
        renderParentQueue();
    }
    // If the teacher screen is visible, update it live!
    if (document.getElementById('teacher-screen').classList.contains('active')) {
        renderTeacherQueue();
        renderCompletedMeetings();
    }
});

// Load any existing data when the page first opens
window.onload = function() {
    loadData();
};

// ----------------------------------------

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function logout() {
    clearInterval(timerInterval); 
    showScreen('home-screen');
}

// 3. PARENT FUNCTIONS
function enterParentDashboard() {
    loadData(); // Make sure we have the latest data before logging in
    const enteredCode = document.getElementById("parent-code-input").value;
    const matchedStudent = students.find(s => s.code === enteredCode);
    
    if (matchedStudent) {
        currentStudent = matchedStudent;
        document.getElementById("parent-code-input").value = ""; 
        document.getElementById("welcome-parent-name").innerText = currentStudent.parentName;
        
        renderTeacherCheckboxes();
        renderParentQueue();
        showScreen('parent-screen');
    } else {
        alert("Invalid code. Please check your 4-digit student code.");
    }
}

function renderTeacherCheckboxes() {
    const container = document.getElementById('teacher-checkboxes');
    container.innerHTML = ""; 

    teachers.forEach(teacher => {
        const div = document.createElement('div');
        div.className = "teacher-item";
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = teacher;
        checkbox.id = "chk-" + teacher;
        
        if (queues[teacher].find(s => s.id === currentStudent.id)) {
            checkbox.checked = true;
        }
        
        checkbox.addEventListener('change', function() {
            let currentlySelectedCount = teachers.filter(t => queues[t].find(s => s.id === currentStudent.id)).length;
            
            if (this.checked) {
                if (currentlySelectedCount >= 6) {
                    alert("You can only select up to 6 teachers!");
                    this.checked = false;
                } else {
                    queues[teacher].push(currentStudent);
                }
            } else {
                queues[teacher] = queues[teacher].filter(s => s.id !== currentStudent.id);
            }
            saveData(); // MAGIC: Save changes immediately so other windows see it
            renderParentQueue();
        });

        const label = document.createElement('label');
        label.htmlFor = "chk-" + teacher;
        label.innerText = " " + teacher;

        div.appendChild(checkbox);
        div.appendChild(label);
        container.appendChild(div);
    });
}

function renderParentQueue() {
    const queueList = document.getElementById('parent-queue-list');
    queueList.innerHTML = ""; 

    teachers.forEach(teacher => {
        let queuePosition = queues[teacher].findIndex(s => s.id === currentStudent.id);
        
        if (queuePosition !== -1) {
            let actualPosition = queuePosition + 1; 
            let waitTime = queuePosition * 10; 
            
            const li = document.createElement('li');
            li.innerHTML = `<strong>${teacher}</strong> <br> Position: #${actualPosition} | Est. Wait: ${waitTime} mins`;
            queueList.appendChild(li);
        }
    });

    if(queueList.innerHTML === "") {
        queueList.innerHTML = "<li>You have not joined any queues yet.</li>";
    }
}

// 4. TEACHER FUNCTIONS
function enterTeacherDashboard() {
    loadData(); // Make sure we have the latest data before logging in
    const enteredCode = document.getElementById("teacher-code-input").value;
    const matchedTeacher = teacherData.find(t => t.code === enteredCode);
    
    if (matchedTeacher) {
        currentTeacher = matchedTeacher.name; 
        document.getElementById("teacher-code-input").value = ""; 
        document.getElementById("welcome-teacher-name").innerText = currentTeacher;
        
        updateTimerDisplay();
        renderTeacherQueue();
        renderCompletedMeetings();
        showScreen('teacher-screen');
    } else {
        alert("Invalid code. Please check your 4-digit teacher code.");
    }
}

function renderTeacherQueue() {
    let myQueue = queues[currentTeacher];
    const queueList = document.getElementById('teacher-queue-list');
    queueList.innerHTML = "";

    if (myQueue.length > 0) {
        let currentParent = myQueue[0];
        document.getElementById("current-parent").innerText = currentParent.parentName;
        document.getElementById("child-name").innerText = currentParent.childName;
        document.getElementById("child-grade").innerText = currentParent.grade;
        document.getElementById("child-attendance").innerText = currentParent.attendance;
        
        for(let i = 1; i < myQueue.length; i++) {
            const li = document.createElement('li');
            li.innerText = `#${i + 1} - ${myQueue[i].parentName} (Child: ${myQueue[i].childName})`;
            queueList.appendChild(li);
        }
    } else {
        document.getElementById("current-parent").innerText = "No one waiting!";
        document.getElementById("child-name").innerText = "-";
        document.getElementById("child-grade").innerText = "-";
        document.getElementById("child-attendance").innerText = "-";
        queueList.innerHTML = "<li>Queue is empty.</li>";
    }
}

function renderCompletedMeetings() {
    let myCompleted = completedMeetings[currentTeacher];
    const tableBody = document.getElementById('completed-meetings-list');
    tableBody.innerHTML = "";

    if (myCompleted.length === 0) {
        tableBody.innerHTML = "<tr><td colspan='3'>No meetings completed yet.</td></tr>";
    } else {
        myCompleted.forEach(meeting => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${meeting.childName}</td>
                <td>${meeting.timeTaken}</td>
                <td>${meeting.notes}</td>
            `;
            tableBody.appendChild(row);
        });
    }
}

function updateTimerDisplay() {
    let secs = teacherSeconds[currentTeacher];
    let m = Math.floor(secs / 60);
    let s = secs % 60;
    m = m < 10 ? "0" + m : m;
    s = s < 10 ? "0" + s : s;
    document.getElementById('timer').innerText = m + ":" + s;
}

function startTimer() {
    clearInterval(timerInterval); 
    timerInterval = setInterval(() => {
        teacherSeconds[currentTeacher]++;
        updateTimerDisplay();

        if (teacherSeconds[currentTeacher] === 600) {
            alert("Time is up! 10 minutes have passed for " + currentTeacher);
        }
    }, 1000); 
}

function completeMeeting() {
    clearInterval(timerInterval); 
    
    let myQueue = queues[currentTeacher];
    if (myQueue.length > 0) {
        let currentParent = myQueue[0];
        let finalTime = document.getElementById('timer').innerText;
        let finalNotes = document.getElementById('teacher-notes').value;
        if (finalNotes === "") finalNotes = "-"; 

        completedMeetings[currentTeacher].push({
            childName: currentParent.childName,
            timeTaken: finalTime,
            notes: finalNotes
        });

        myQueue.shift(); 
        saveData(); // MAGIC: Save the changes so other windows see the line moving!
        
        document.getElementById('teacher-notes').value = "";
        teacherSeconds[currentTeacher] = 0; 
        updateTimerDisplay(); 
        
        renderTeacherQueue(); 
        renderCompletedMeetings();
    }
}