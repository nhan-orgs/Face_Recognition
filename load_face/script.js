// Everything's ok
// Testing in script1.js

const video = document.getElementById('video')

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
        faceapi.loadSsdMobilenetv1Model('/models'),
        faceapi.loadFaceRecognitionModel('/models'),
        faceapi.loadFaceLandmarkModel('/models'),
    ])
    Toastify({
        text: 'Models loaded successfully',
    }).showToast()
}

// let faceDescriptors = [];
// loadDescriptorsFromJSON();
// let faceMatcher;

// async function takeImage(){
//     await loadFaceAPI();

//     // Load the descriptors
//     console.log(faceDescriptors.length);
//     faceMatcher = new faceapi.FaceMatcher(faceDescriptors, 0.6);

// }

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

function loadFaceMatcher() {
    faceMatcher = new faceapi.FaceMatcher(faceDescriptors, 0.6)
}

let faceDescriptors = []
let faceMatcher

video.addEventListener('play', async () => {
    function loadFaceMatcher() {
        faceMatcher = new faceapi.FaceMatcher(faceDescriptors, 0.4)
        console.log(faceMatcher)
    }
    await loadFaceAPI()
    await loadDescriptorsFromJSON()

    const interval = setInterval(() => {
        if (faceDescriptors.length > 0) {
            clearInterval(interval)
            loadFaceMatcher()
        }
    }, 100)
})
