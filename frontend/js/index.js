const form = document.getElementById("fileUpload");

form.addEventListener("submit", function (e) {

    e.preventDefault();

    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];


    if (!file) {
        alert("No File Uploaded");
        return;

    }
    console.log(file);

})