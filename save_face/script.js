const video = document.getElementById("video");
const btnTakeImg = document.getElementById("button");

navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
    video.play();
  })
  .catch((error) => {
    console.log("An error has occurred: ", error);
  });

const loadFaceAPI = async () => {
  await Promise.all([
    faceapi.loadSsdMobilenetv1Model("./models"),
    faceapi.loadFaceRecognitionModel("./models"),
    faceapi.loadFaceLandmarkModel("./models"),
  ]);

  Toastify({
    text: "Models loaded successfully",
  }).showToast();
};

btnTakeImg.addEventListener("click", loadFaceAPI);

let faceDescriptors = ["Viet"];

async function takeImage() {
  await loadFaceAPI();

  let detects = await faceapi
    .detectSingleFace(video)
    .withFaceLandmarks()
    .withFaceDescriptor(); // Tested

  console.log(detects.descriptor);
  faceDescriptors.push(detects.descriptor);
  console.log(faceDescriptors);

  if (faceDescriptors.length > 4) {
    downloadDescriptorsAsJSON();
  }
  // Save the descriptor
}

async function downloadDescriptorsAsJSON() {
  const descriptorsArray = Array.from(faceDescriptors);
  const jsonData = JSON.stringify(descriptorsArray);
  const res = await axios.post(`http://localhost:8000/save`, {
    data: jsonData,
  });
  console.log(res);
}
