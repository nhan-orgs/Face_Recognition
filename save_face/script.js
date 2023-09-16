import { baseAxios } from './config.js'

const errors = {
  CANT_RECOGNIZE: "Cannot read properties of undefined (reading 'descriptor')",
}

let faceDescriptors = []
let images = []

const video = document.getElementById('video')
const btnTakeImg = document.querySelector('.take-img-btn')
const imgTakenEl = document.querySelector('.image-taken')
const captureImgWrappers = document.querySelectorAll('.js-capture-img-wrapper')

// UI script
const titleEl = document.querySelector('.js-register-user')

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

    return response.data
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

const uploadUserImages = async (id) => {
  try {
    const data = new FormData()
    images.forEach((imageDataUrl, index) => {
      const file = dataURLtoFile(imageDataUrl, id + `_${index}.png`)
      data.append('images', file)
    })

    await baseAxios.post(`/user/upload/${id}`, data)
  } catch (error) {
    console.log('Upload user image error:', error)
  }
}

btnSave.addEventListener('click', async () => {
  closeModal()
  const userData = await registerUserService()
  uploadUserImages(userData._id)
  resetDefaultState()
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
  if (hasUserId()) {
    saveImages(getCurrUserId())
  } else {
    modalEl.classList.remove('pointer-events-none', 'opacity-0')
  }
})

async function saveImages(userId) {
  try {
    const descriptorsArray = Array.from(faceDescriptors)
    const jsonData = JSON.stringify(descriptorsArray)

    baseAxios.put(`/user/${userId}`, {
      descriptor: jsonData,
    })
    uploadUserImages(userId)
  } catch (error) {
    console.log('Save images error:', error)
  }
}

// End

captureImgWrappers.forEach((wrapper, index) => {
  wrapper.querySelector('.js-button-delete').addEventListener('click', () => {
    deleteImage(index)
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

// const enableImage = (dataURL) => {
//   const captureImg = captureImgWrappers[faceDescriptors.length].querySelector('.js-capture-img')
//   const placeholderImg = captureImgWrappers[faceDescriptors.length].querySelector('.js-placeholder-img')
//   captureImgWrappers[faceDescriptors.length].classList.remove('pointer-events-none')
//   captureImg.src = dataURL
//   captureImg.classList.remove('hidden')
//   placeholderImg.classList.add('hidden')
// }

const setImage = (dataURL, index) => {
  const captureImg = captureImgWrappers[index].querySelector('.js-capture-img')
  const placeholderImg = captureImgWrappers[index].querySelector('.js-placeholder-img')
  captureImgWrappers[index].classList.remove('pointer-events-none')
  captureImg.src = dataURL
  captureImg.classList.remove('hidden')
  placeholderImg.classList.add('hidden')
}

const removeImage = (index) => {
  const captureImg = captureImgWrappers[index].querySelector('.js-capture-img')
  const placeholderImg = captureImgWrappers[index].querySelector('.js-placeholder-img')
  captureImgWrappers[index].classList.add('pointer-events-none')
  captureImg.src = ''
  captureImg.classList.add('hidden')
  placeholderImg.classList.remove('hidden')
}

const deleteImage = (index) => {
  if (index < 0) {
    console.log('Delete image index < 0')
    return
  }

  faceDescriptors.splice(index, 1)
  images.splice(index, 1)
  updateSaveDescriptorButton()
  updateImages()

  // for (let i = index; i < faceDescriptors.length - 1; i++) {
  //   const captureImg = captureImgWrappers[i].querySelector('.js-capture-img')
  //   const nextImg = captureImgWrappers[i + 1].querySelector('.js-capture-img')
  //   captureImg.src = nextImg.src
  // }
  // disableImage(faceDescriptors.length - 1)
  // faceDescriptors.splice(index, 1)
  // updateSaveDescriptorButton()
}

const captureImage = () => {
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
  const dataURL = canvas.toDataURL()

  return dataURL
}

async function takeImage() {
  try {
    if (faceDescriptors.length >= 4) {
      return
    }

    const imgData = captureImage()
    images.push(imgData)
    updateImages()

    btnTakeImg.classList.add('button-loading')
    btnTakeImg.disabled = true
    btnTakeImg.querySelector('p').classList.add('hidden')
    btnTakeImg.querySelector('svg').classList.remove('hidden')

    // Recognize face
    await loadFaceAPI()
    let detects = await faceapi
      .detectSingleFace(getImage(faceDescriptors.length))
      .withFaceLandmarks()
      .withFaceDescriptor() // Tested

    console.log(detects)

    faceDescriptors.push(detects.descriptor)
    imgTakenEl.innerHTML = `Images taken: ${faceDescriptors.length}/4`

    if (faceDescriptors.length >= 4) {
      updateSaveDescriptorButton()
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
    console.log('Took image failed:', error)
    if (String(error).includes(errors.CANT_RECOGNIZE)) {
      images.splice(images.length - 1, 1)
      updateImages()
    }
  } finally {
    btnTakeImg.classList.remove('button-loading')
    btnTakeImg.disabled = false
    btnTakeImg.querySelector('p').classList.remove('hidden')
    btnTakeImg.querySelector('svg').classList.add('hidden')
  }
}

async function updateSaveDescriptorButton() {
  if (faceDescriptors.length === 4) {
    enableBtn(btnSaveUser)
    disableBtn(btnTakeImg)
  } else {
    disableBtn(btnSaveUser)
    enableBtn(btnTakeImg)
  }
}

function updateImages() {
  for (let i = 0; i < 4; i++) {
    if (i in images) {
      setImage(images[i], i)
    } else {
      removeImage(i)
    }
  }
  imgTakenEl.innerHTML = `Images taken: ${faceDescriptors.length}/4`
}

function getImage(index) {
  return captureImgWrappers[index].querySelector('.js-capture-img')
}

// Load user data
function getCurrUserId() {
  const urlSearchParams = new URLSearchParams(window.location.search)
  return urlSearchParams.get('userId')
}

function hasUserId() {
  return getCurrUserId() !== 'undefined'
}

const fetchUserImages = async (id) => {
  try {
    const response = await baseAxios.get(`/user/${id}/images`)
    return response.data
  } catch (error) {
    console.log('fetchUserData error:', error)
  }
}

const userId = getCurrUserId()
if (hasUserId()) {
  titleEl.innerHTML = "Update User's Images"
  const userData = await fetchUserImages(userId)
  if (userData) {
    images = userData.images.map((imgBase64) => {
      const dataUri = 'data:image/png;base64,' + imgBase64
      return dataUri
    })
    faceDescriptors = JSON.parse(userData.descriptor)
    titleEl.innerHTML = `Update ${userData.fullName}'s Images`
    updateSaveDescriptorButton()
    updateImages()
    disableBtn(btnSaveUser)
  }
} else {
  titleEl.innerHTML = 'Register New User'
}

function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[arr.length - 1]),
    n = bstr.length,
    u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

function resetDefaultState() {
  // Reset state
  faceDescriptors = []
  images = []
  updateSaveDescriptorButton()
  updateImages()
  inputEmail.value = ''
  inputPwd.value = ''
  inputOrg.value = ''
  inputFullName.value = ''
}
