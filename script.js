
const video = document.getElementById("video");

navigator.mediaDevices.getUserMedia({video: true}).then(stream => {
    video.srcObject = stream;
    video.play();
}).catch(error => {
    console.log("An error has occurred: ", error)
})


const loadFaceAPI = async () => {
    await Promise.all([
        faceapi.loadSsdMobilenetv1Model('/models'),
        faceapi.loadFaceRecognitionModel('/models'),
        faceapi.loadFaceLandmarkModel('/models'),
    ])

    Toastify({
        text: "Models loaded successfully",
    }).showToast();
}

let faceDescriptors = ["Viet"];

async function takeImage(){
    await loadFaceAPI();

    let detects = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor(); // Tested
    
    console.log(detects.descriptor);
    faceDescriptors.push(detects.descriptor);
    console.log(faceDescriptors);
    if(faceDescriptors.length > 4){
        
        downloadDescriptorsAsJSON();
    }
    // Save the descriptor

}

function downloadDescriptorsAsJSON() {
    const descriptorsArray = Array.from(faceDescriptors);
    const jsonData = JSON.stringify(descriptorsArray);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement("a");
    link.href = url;
    link.download = "face_descriptors.json";
    link.click();
  
    URL.revokeObjectURL(url);
  }