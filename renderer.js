// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.


document.querySelector('#dirOpenBtn').addEventListener('click',()=>{

    let logContainer = document.querySelector("#logList")
    logContainer.innerHTML = ''
    window.electronAPI.openDirPopup()

})

window.electronAPI.onTraverseLog( (event, value) => {
    // console.log(event, value)

    let logContainer = document.querySelector("#logList")

    let el = document.createElement('div')

    el.textContent = value

    logContainer.appendChild( el )
})


