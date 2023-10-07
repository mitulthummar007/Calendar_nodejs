const calendarData = [];
const calendar = document.querySelector("#calendar");
const monthBanner = document.querySelector("#month");
let navigation = 0;
let clicked = null;
let events = localStorage.getItem("events") ? JSON.parse(localStorage.getItem("events")) : [];
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function loadCalendar() {
  const dt = new Date();
  if (navigation != 0) {
    dt.setMonth(new Date().getMonth() + navigation);
  }
  const day = dt.getDate();
  const month = dt.getMonth();
  const year = dt.getFullYear();
  monthBanner.innerText = `${dt.toLocaleDateString("en-us", {
    month: "long",
  })} - ${year}`;
  calendar.innerHTML = "";
  const dayInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayofMonth = new Date(year, month, 1);
  const dateText = firstDayofMonth.toLocaleDateString("en-us", {
    weekday: "long",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  const dayString = dateText.split(", ")[0];
  const emptyDays = weekdays.indexOf(dayString);

  for (let i = 1; i <= dayInMonth + emptyDays; i++) {
    const dayBox = document.createElement("div");
    dayBox.classList.add("day");
    const monthVal = month + 1 < 10 ? "0" + (month + 1) : month + 1;
    const dateVal = i - emptyDays < 10 ? "0" + (i - emptyDays) : i - emptyDays;
    const dateText = `${dateVal}-${monthVal}-${year}`;
    if (i > emptyDays) {
      dayBox.innerText = i - emptyDays;
      const eventOfTheDay = events.find((e) => e.date == dateText);

      if (i - emptyDays === day && navigation == 0) {
        dayBox.id = "currentDay";
      }

      if (eventOfTheDay) {
        const eventDiv = document.createElement("div");
        eventDiv.classList.add("event");
        eventDiv.innerText = eventOfTheDay.title;
        dayBox.appendChild(eventDiv);
      }

      dayBox.addEventListener("dblclick", () => {
        showModal(dateText);
      });
    } else {
      dayBox.classList.add("plain");
    }
    calendar.append(dayBox);
  }
}
async function buttons() {
  const btnBack = document.querySelector("#btnBack");
  const btnNext = document.querySelector("#btnNext");
  const btnDelete = document.getElementById("btnDelete");
  const btnSave = document.querySelector("#btnSave");
  const closeButtons = document.querySelectorAll(".btnClose");
  const txtTitle = document.querySelector("#txtTitle");
  try {
    const response = await fetch('/Notes', {
      method: 'GET',
    });

    if (response.status === 200) {
      const eventData = await response.json();
      calendarData.push(eventData)
      localStorage.setItem("events", JSON.stringify(calendarData[0]));
    } else {
      console.error('Failed to save event:', response.statusText);
    }
    txtTitle.value = "";
    closeModal();

  } catch (error) {
    console.error('Error:', error);
  }
  btnSave.addEventListener("click", async function () {
    const txtTitle = document.querySelector("#txtTitle");
    const title = txtTitle.value.trim();
    if (title) {
      txtTitle.classList.remove("error");
      const date = clicked;
      try {
        await fetch('/notes', {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ date, title }),
        })
          .then((response) => {
            console.log(response);
            return response.json(); 
          })
          .then((data) => {
            events.push({
              _id: data.data._id,
              date: data.data.date,
              title: data.data.title,
            });
            localStorage.setItem("events", JSON.stringify(events));
            location.reload();
          })
          .catch((error) => {
            console.error(error);
          });
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      txtTitle.classList.add("error");
    }
  });


  btnBack.addEventListener("click", () => {
    navigation--;
    loadCalendar();
  });
  btnNext.addEventListener("click", () => {
    navigation++;
    loadCalendar();
  });

  modal.addEventListener("click", closeModal);
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });

  btnDelete.addEventListener("click", async function () {
    try {
      let ID = document.querySelector("#notID").value;
      const response = await fetch(`/Notes/${ID}`, {
        method: 'DELETE',
      });

      if (response.status == 200) {
        const eventData = await response.json();
        console.log('Event deleted:', eventData);

        events = events.filter((event) => event._id !== ID);
        localStorage.removeItem(clicked);
        localStorage.setItem("events", JSON.stringify(events));
        loadCalendar();
        closeModal();
      } else {
        console.error("Error deleting event");
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
  btnSave.addEventListener("click", function () {
    if (txtTitle.value) {
      txtTitle.classList.remove("error");
      txtTitle.value = "";
      closeModal();
    } else {
      txtTitle.classList.add("error");
    }
  });
}

const modal = document.querySelector("#modal");
const viewEventForm = document.querySelector("#viewEvent");
const addEventForm = document.querySelector("#addEvent");

function showModal(dateText) {
  clicked = dateText;
  const eventOfTheDay = events.find((e) => e.date == dateText);
  if (eventOfTheDay) {
    console.log(events);
    document.querySelector("#eventText").innerText = eventOfTheDay.title;
    document.getElementById("notID").setAttribute('value', eventOfTheDay._id);
    viewEventForm.style.display = "block";
  } else {
    addEventForm.style.display = "block";
  }
  modal.style.display = "block";
}
function closeModal() {
  viewEventForm.style.display = "none";
  addEventForm.style.display = "none";
  modal.style.display = "none";
  clicked = null;
  loadCalendar();
}

buttons();
loadCalendar();

//--------------select Logic-----------------------
const yearSelect = document.querySelector("#yearSelect");
const monthSelect = document.querySelector("#monthSelect");
const btnShowCalendar = document.querySelector("#btnShowCalendar");

function populateYearDropdown() {
  const currentYear = new Date().getFullYear();
  for (let year = currentYear - 33; year <= currentYear + 27; year++) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }
}

populateYearDropdown();

btnShowCalendar.addEventListener("dblclick", () => {
  const selectedYear = parseInt(yearSelect.value, 10);
  const selectedMonth = parseInt(monthSelect.value, 10);
  navigation = (selectedYear - new Date().getFullYear()) * 12 + selectedMonth - new Date().getMonth();
  
  loadCalendar();
});

