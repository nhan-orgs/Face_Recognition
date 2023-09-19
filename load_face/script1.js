import { baseAxios } from './config.js'

const video = document.getElementById('video')
const resultLabel = document.getElementById('result-label')

const getUserData = async (ids) => {
  try {
    if (!Array.isArray(ids)) {
      throw new Error('ids is not an array')
    }
    const idsParam = ids.map((id) => encodeURIComponent(id)).join('|')
    const response = await baseAxios.get('/user/descriptor', {
      params: {
        ids: idsParam,
      },
    })
    if (!response || !response.data) {
      throw new Error('Empty response or response has no data attribute')
    }

    return response.data
  } catch (error) {
    console.log('Get user data error: ', error)
  }
}

function startWebcam() {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream
      video.play()
    })
    .catch((error) => {
      console.log('An error has occurred: ', error)
    })
}

const loadFaceAPI = async () => {
  await Promise.all([
    faceapi.loadSsdMobilenetv1Model(config.MODELS_URL),
    faceapi.loadFaceRecognitionModel(config.MODELS_URL),
    faceapi.loadFaceLandmarkModel(config.MODELS_URL),
  ])
  Toastify({
    text: 'Models loaded successfully',
  }).showToast()
}

async function loadDescriptorsFromJSON() {
  try {
    const searchParams = new URLSearchParams(window.location.search)

    const idsParam = searchParams.get('ids')
    if (!idsParam) {
      throw new Error('No ids provided in URL')
    }
    const ids = idsParam.split('|')
    const descriptorsData = await getUserData(ids)

    if (!Array.isArray(descriptorsData)) {
      throw new Error('Descriptors data is not an array')
    }

    descriptorsData.forEach((descriptorData) => {
      const [name, descriptors] = convertDataFormat(descriptorData)
      faceDescriptors.push(new faceapi.LabeledFaceDescriptors(name, descriptors))
    })
  } catch (error) {
    console.log('Load descriptors from json error: ', error)
  }
}

function convertDataFormat(jsonData) {
  let face_descriptors = []
  let label = null
  for (const jd of jsonData) {
    if (typeof jd === 'string') {
      label = jd
    } else {
      let values = Object.values(jd)
      values = new Float32Array(values)
      face_descriptors.push(values)
    }
  }
  return [label, face_descriptors]
}

let faceDescriptors = []
let faceMatcher

Promise.all([
  faceapi.loadSsdMobilenetv1Model(config.MODELS_URL),
  faceapi.loadFaceRecognitionModel(config.MODELS_URL),
  faceapi.loadFaceLandmarkModel(config.MODELS_URL),
]).then(startWebcam)

video.addEventListener('play', async () => {
  function loadFaceMatcher() {
    faceMatcher = new faceapi.FaceMatcher(faceDescriptors, 0.4)
    console.log(faceMatcher)
  }
  // await loadFaceAPI();
  await loadDescriptorsFromJSON()

  const interval = setInterval(() => {
    if (faceDescriptors.length > 0) {
      clearInterval(interval)
      loadFaceMatcher()
    }
  }, 100)

  const displaySize = { width: video.width, height: video.height }

  setInterval(async () => {
    try {
      if (faceDescriptors.length > 0) {
        const detections = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)

        const result = faceMatcher.findBestMatch(detections.descriptor)

        if (result.label != 'unknown') {
          resultLabel.innerText = 'Hello ' + result.label
        } else {
          resultLabel.innerText = 'Cannot Recognise'
        }
      }
    } catch (error) {
      console.log('Recognizing error: ', error)
    }
  }, 100)
})
