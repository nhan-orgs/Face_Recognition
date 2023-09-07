import config from './config.js'

const video = document.getElementById('video')
const btnTakeImg = document.querySelector('.take-img-btn')
const imgTakenEl = document.querySelector('.image-taken')

// UI script
const modalEl = document.querySelector('.modal')
const modalContentEl = document.querySelector('.modal .modal-content')
const btnCancel = modalEl.querySelector('.button.button-secondary')
const btnSave = modalEl.querySelector('.button.button-primary')
const btnClose = modalEl.querySelector('.button.modal-close')

const closeModal = () => {
  modalEl.classList.add('pointer-events-none', 'opacity-0')
}

modalEl.addEventListener('click', closeModal)
btnClose.addEventListener('click', closeModal)
modalContentEl.addEventListener('click', (e) => {
  e.stopPropagation()
})
btnCancel.addEventListener('click', closeModal)

// Save user
btnSave.addEventListener('click', () => {
  closeModal()
})
//

navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream
    video.play()
  })
  .catch((error) => {
    console.log('An error has occurred: ', error)
  })

const loadFaceAPI = async () => {
  await Promise.all([
    faceapi.loadSsdMobilenetv1Model('../models'),
    faceapi.loadFaceRecognitionModel('../models'),
    faceapi.loadFaceLandmarkModel('../models'),
  ])
}

btnTakeImg.addEventListener('click', takeImage)

let faceDescriptors = ['Viet']

async function takeImage() {
  try {
    if (faceDescriptors.length >= 5) {
      return
    }

    btnTakeImg.classList.add('button-loading')
    btnTakeImg.disabled = true
    btnTakeImg.querySelector('p').classList.add('hidden')
    btnTakeImg.querySelector('svg').classList.remove('hidden')
    await loadFaceAPI()

    let detects = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor() // Tested
    console.log(detects)

    // console.log(detects.descriptor)
    faceDescriptors.push(detects.descriptor)
    imgTakenEl.innerHTML = `Images taken: ${faceDescriptors.length - 1}/4`
    // console.log(faceDescriptors)

    if (faceDescriptors.length > 4) {
      activeSaveDescriptor()
    }

    Toastify({
      text: 'Took image successfully!',
      style: {
        background: '#0071e3',
        transform: 'translate(0px, 0px)',
        fontSize: '14px',
        borderRadius: '8px',
        top: '15px',
      },
    }).showToast()
    // Save the descriptor
  } catch (error) {
    Toastify({
      text: 'Some errors occured',
      style: {
        background: 'rgb(255, 95, 109)',
        transform: 'translate(0px, 0px)',
        fontSize: '14px',
        borderRadius: '8px',
        top: '15px',
      },
    }).showToast()
    console.log(error)
  } finally {
    btnTakeImg.classList.remove('button-loading')
    btnTakeImg.disabled = false
    btnTakeImg.querySelector('p').classList.remove('hidden')
    btnTakeImg.querySelector('svg').classList.add('hidden')
  }
}

async function activeSaveDescriptor() {
  const descriptorsArray = Array.from(faceDescriptors)
  const jsonData = JSON.strfingify(descriptorsArray)
  // const res = await axios.post(`${config.API_BASE}register`, {
  //   data: jsonData,
  // })
  // console.log(res)
  document.querySelector('.save-user-btn').classList.remove('disable')
}
