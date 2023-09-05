const video = document.getElementById('video')
const resultLabel = document.getElementById('result-label')

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
        faceapi.loadSsdMobilenetv1Model('../models'),
        faceapi.loadFaceRecognitionModel('../models'),
        faceapi.loadFaceLandmarkModel('../models'),
    ])
    Toastify({
        text: 'Models loaded successfully',
    }).showToast()
}

function loadDescriptorsFromJSON() {
    fetch('face_descriptors.json')
        .then((response) => response.json())
        .then((data) => {
            // Convert objects to Float32Arrays

            console.log('Descriptors loaded successfully!')

            let [name, descriptors] = convertDataFormat(data)
            faceDescriptors.push(new faceapi.LabeledFaceDescriptors(name, descriptors))
        })
        .catch((error) => {
            console.error('An error occurred while loading the JSON file:', error)
        })
}

function convertDataFormat(jsonData) {
    let face_descriptors = []
    let label = null
    for (jd of jsonData) {
        if (typeof jd === 'string') {
            label = jd
        } else {
            values = Object.values(jd)
            values = new Float32Array(values)
            face_descriptors.push(values)
        }
    }
    return [label, face_descriptors]
}

let faceDescriptors = []
let faceMatcher

Promise.all([
    faceapi.loadSsdMobilenetv1Model('/models'),
    faceapi.loadFaceRecognitionModel('/models'),
    faceapi.loadFaceLandmarkModel('/models'),
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
    // const canvas = faceapi.createCanvasFromMedia(video);
    // document.body.append(canvas);

    // const displaySize = {width: video.width, height: video.height};
    // faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        const detections = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)

        const result = faceMatcher.findBestMatch(detections.descriptor)

        if (result.label != 'unknown') {
            resultLabel.innerText = 'Hello ' + result.label
        } else {
            resultLabel.innerText = 'Cannot Recognise'
        }
    }, 100)
})
