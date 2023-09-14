import { baseAxios } from './config.js'

let faceDescriptors = []

const video = document.getElementById('video')
const btnTakeImg = document.querySelector('.take-img-btn')
const imgTakenEl = document.querySelector('.image-taken')
const captureImgWrappers = document.querySelectorAll('.js-capture-img-wrapper')

// UI script
const btnSaveUser = document.querySelector('.save-user-btn')

const modalEl = document.querySelector('.modal')
const modalContentEl = document.querySelector('.modal .modal-content')
const btnCancel = modalEl.querySelector('.button.button-secondary')
const btnSave = modalEl.querySelector('.button.button-primary')
const btnClose = modalEl.querySelector('.button.modal-close')

const inputEmail = modalEl.querySelector('#email')
const inputPwd = modalEl.querySelector('#password')
const inputOrg = modalEl.querySelector('#org')
const inputFullName = modalEl.querySelector('#fullName')

const closeModal = () => {
  modalEl.classList.add('pointer-events-none', 'opacity-0')
}

modalEl.addEventListener('click', closeModal)
btnClose.addEventListener('click', closeModal)
modalContentEl.addEventListener('click', (e) => {
  e.stopPropagation()
})

btnCancel.addEventListener('click', closeModal)

const registerUserService = async () => {
  try {
    const descriptorsArray = Array.from(faceDescriptors)
    const jsonData = JSON.stringify(descriptorsArray)

    const response = await baseAxios.post('/user/register', {
      email: inputEmail.value,
      password: inputPwd.value,
      org: inputOrg.value,
      fullName: inputFullName.value,
      descriptor: jsonData,
    })
    Toastify({
      text: 'Registered user successfully!',
      style: {
        background: '#0071e3',
        transform: 'translate(0px, 0px)',
        fontSize: '14px',
        borderRadius: '8px',
        top: '15px',
      },
    }).showToast()

    // Reset state
    faceDescriptors = []
    imgTakenEl.innerHTML = 'Images taken: 0/4'
    enableBtn(btnTakeImg)
    disableBtn(btnSaveUser)
    inputEmail.value = ''
    inputPwd.value = ''
    inputOrg.value = ''
    inputFullName.value = ''
  } catch (error) {
    Toastify({
      text: 'Register user failed',
      style: {
        background: 'rgb(255, 95, 109)',
        transform: 'translate(0px, 0px)',
        fontSize: '14px',
        borderRadius: '8px',
        top: '15px',
      },
    }).showToast()
    console.log('Register user error: ', error)
  }
}

btnSave.addEventListener('click', () => {
  closeModal()
  registerUserService()
})

const disableBtn = (btn) => {
  btn.classList.add('disable')
  btn.disabled = true
}

const enableBtn = (btn) => {
  btn.classList.remove('disable')
  btn.disabled = false
}

btnSaveUser.addEventListener('click', () => {
  modalEl.classList.remove('pointer-events-none', 'opacity-0')
})
// End

captureImgWrappers.forEach((wrapper, index) => {
  wrapper.querySelector('.js-button-delete').addEventListener('click', () => {
    faceDescriptors.splice(index, 1)
    disableImage()
  })
})

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

const enableImage = (dataURL) => {
  const captureImg = captureImgWrappers[faceDescriptors.length].querySelector('.js-capture-img')
  const placeholderImg = captureImgWrappers[faceDescriptors.length].querySelector('.js-placeholder-img')
  captureImgWrappers[faceDescriptors.length].classList.remove('pointer-events-none')
  captureImg.src = dataURL
  captureImg.classList.remove('hidden')
  placeholderImg.classList.add('hidden')
}

const disableImage = (index) => {
  // for (let i = index; i < faceDescriptors.length; i++) {
  //   const captureImg = captureImgWrappers[faceDescriptors.length].querySelector('.js-capture-img')
  //   const placeholderImg = captureImgWrappers[faceDescriptors.length].querySelector('.js-placeholder-img')
  //   captureImgWrappers[faceDescriptors.length].classList.add('pointer-events-none')
  //   captureImg.src = ''
  //   captureImg.classList.add('hidden')
  //   placeholderImg.classList.remove('hidden')
  // }
}

const captureImage = () => {
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
  const dataURL = canvas.toDataURL()

  enableImage(dataURL)

  return dataURL
}

async function takeImage() {
  try {
    if (faceDescriptors.length >= 4) {
      return
    }

    const imgData = captureImage()
    const base64Response = await fetch(imgData)
    const blob = await base64Response.blob()
    const img = await faceapi.bufferToImage(blob)

    btnTakeImg.classList.add('button-loading')
    btnTakeImg.disabled = true
    btnTakeImg.querySelector('p').classList.add('hidden')
    btnTakeImg.querySelector('svg').classList.remove('hidden')
    await loadFaceAPI()

    let detects = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor() // Tested

    // let detects = await faceapi
    //   .detectSingleFace(video)
    //   .withFaceLandmarks()
    //   .withFaceDescriptor() // Tested

    console.log(detects)

    // console.log(detects.descriptor)
    faceDescriptors.push(detects.descriptor)
    imgTakenEl.innerHTML = `Images taken: ${faceDescriptors.length}/4`
    // console.log(faceDescriptors)

    if (faceDescriptors.length >= 4) {
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
    console.log('Took image failed: ', error)
  } finally {
    btnTakeImg.classList.remove('button-loading')
    btnTakeImg.disabled = false
    btnTakeImg.querySelector('p').classList.remove('hidden')
    btnTakeImg.querySelector('svg').classList.add('hidden')
  }
}

async function activeSaveDescriptor() {
  // Enable btn save user
  enableBtn(btnSaveUser)
  // Disable btn take image
  disableBtn(btnTakeImg)
}
