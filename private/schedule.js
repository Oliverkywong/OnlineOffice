
// const socket = io.connect();

function createtalbe() {
    let id = 0;
    let hour = 8;
    for (let y = 0; y <= 24; y++) {
        document.querySelector(".time-interval").innerHTML += `
        <div>${hour%24}:00</div>`
        hour++
        for (let x = 0; x <= 7; x++) {
            document.querySelector(".content").innerHTML += `
            <div class="time" data-id="${id}">
            <textarea></textarea>
            </div>`
            id++
        }
    }

    const times = document.querySelectorAll(".time")
    for (const time of times) {
        time.addEventListener("click", function () {
            time.classList.add('active')
            time.querySelector('textarea').focus()
            time.querySelector('textarea').addEventListener('blur', function () {
                // e.stopPropagation()
                // time.classList.remove('active')

                const content = time.querySelector('textarea').value
                const id = time.dataset.id
                // document.querySelector(`#${id}`).innerHTML += `
                // <textarea>${content}</textarea>`
            })
        })
        // document.querySelector(`#${id}`).addEventListener("click", function () {
        //     time.classList.remove('active')
        // });
    }

}

let dragged;

document.addEventListener("dragstart", event => {
  dragged = event.target;
  event.target.classList.add("dragging");
});

document.addEventListener("dragend", event => {
  event.target.classList.remove("dragging");
});

document.addEventListener("dragover", event => {
  event.preventDefault();
  event.target.classList.add("active");
}, false);

document.addEventListener("dragenter", event => {
  if (event.target.classList.contains("time")) {
    event.target.classList.add("dragover");
  }
});

document.addEventListener("dragleave", event => {
  if (event.target.classList.contains("time")) {
    event.target.classList.remove("dragover");
  }
});

document.addEventListener("drop", event => {
  event.preventDefault();
  if (event.target.classList.contains("dropzone")) {
    event.target.classList.remove("dragover");
    dragged.parentNode.removeChild(dragged);
    event.target.appendChild(dragged);
  }
});

createtalbe();