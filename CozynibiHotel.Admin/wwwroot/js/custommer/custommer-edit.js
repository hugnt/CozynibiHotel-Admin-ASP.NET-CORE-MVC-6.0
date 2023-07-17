import { HOST, GET_IMAGE_URL } from '../env.js'
import jwt_decode from 'https://cdn.jsdelivr.net/npm/jwt-decode@3.1.2/+esm'


$(document).ready(async function () {
    //GET TOKEN
    var accessToken = $.cookie('AccessToken');

    var decoded = jwt_decode(accessToken);
    const USER_ID = decoded.Id;
    

    //INIT
    var imgList = [];
    var cateList = [];

    var currentUrl = window.location.href;
    const RECORD_ID = currentUrl.split('/').pop();

    const GET_RECORD = HOST + "/api/Custommer/" + RECORD_ID;
    const PUT_RECORD = HOST + "/api/Custommer/" + RECORD_ID;
    const GET_ROOMS = HOST + "/api/Room"

    var newRecord = {
        Images: [],
        FullName: "",
        RoomId: 0,
        PhoneNumber: "",
        Email: "",
        Address: "",
        Country: "",
        Comment: "",
        isActive: false,
        isDeleted: false,
        UpdatedBy: 0,
        CreatedBy:0
    }

    var editRecord = {};



    var editor;
    ClassicEditor
        .create(document.querySelector('#editor'), {
            placeholder: 'This is some sample content....'
        })
        .then(newEditor => {
            editor = newEditor;
        })
        .catch(error => {
            console.error(error);
        });


    $(".section-preview").click(function () {
        $(".section-preview").addClass("border-transparent dark:border-transparent");
        $(".section-preview").removeClass("dark:border-primary text-primary font-medium");
        $(this).removeClass("border-transparent dark:border-transparent");
        $(this).addClass("border-primary dark:border-primary text-primary font-medium");
    });

    $(".upload-img").change(function () {
        var file = this.files[0];

        if (file) {

            var reader = new FileReader();
            reader.onload = function (e) {
                $(".img-show").html("");
                $(".img-show").append(`
                    <div class="img-file col-span-5 md:col-span-2 h-28 relative image-fit cursor-pointer zoom-in">
						<img class="rounded-md" src="${e.target.result}" alt="${file.name}">
						<div title="Remove this image?"
								class="delete-file tooltip w-5 h-5 flex items-center justify-center absolute rounded-full text-white bg-danger right-0 top-0 -mr-2 -mt-2">
							<span>X</span>
						</div>
					</div>
                `);
                editRecord.image = file.name;
                imgList = [];
                imgList.push(file);
                $(".delete-file").click(function () {
                    let imgName = $(this).parent(".img-file").find('img').prop("alt");
                    $(this).parent(".img-file").remove();
                    imgList = imgList.filter(function (file) {
                        return file.name != imgName;
                    });
                    editRecord.image = "";
                    console.log(imgList);
                });
                $(".upload-img").val("");
            }

            reader.readAsDataURL(file);
        }
        else {
            $(".img-show").html(``);
        }
        console.log(imgList);
    });


    //GET THE CHOSEN RECORD
    await getDetails();
    
    async function getDetails() {
        try {
            const res = await $.ajax({
                url: GET_RECORD,
                type: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                contentType: "application/json",
                beforeSend: function () {
                    $(".loading").css("display", "block");
                    $(".main-content").css("display", "none");
                }
            });
            if (res) {
                editRecord = res;
                $(".loading").css("display", "none");
                $(".main-content").css("display", "block");
                console.log(editRecord)
                renderRecord(res);
                
            }
        } catch (e) {
            console.log(e);
            $(".main-layout").css("display", "none");
            $(".notfound").css("display", "block");
        }

    }

    function renderRecord(record) {
        //status 
        if (record.isActive == true) {
            $('#status-active').prop('checked', true);
        }
        else {
            $('#status-active').prop('checked', false);
        }

        //images
        var IMAGE_SRC = GET_IMAGE_URL + "custommer/";
        $(".img-show").html("");
        $(".img-show").append(`
                <div class="img-file col-span-5 md:col-span-2 h-28 relative image-fit cursor-pointer zoom-in">
					<img class="rounded-md" src="${IMAGE_SRC + record.image}" alt="${record.image}">
					<div title="Remove this image?"
							class="delete-file tooltip w-5 h-5 flex items-center justify-center absolute rounded-full text-white bg-danger right-0 top-0 -mr-2 -mt-2">
						<span>X</span>
					</div>
				</div>
            `);
        $(".delete-file").click(function () {
            $(this).parent(".img-file").remove();
            editRecord.image = "";
            console.log(editRecord.images);

        });

        //name
        $("#record-name").val(record.fullName);

        $("#phoneNumber").val(record.phoneNumber);
        $("#email").val(record.email);
        $("#address").val(record.address);
        $("#country").val(record.country);

        //comment
        if (record.comment) {
            editor.setData(record.comment);
        }
   

    }


    //GET LIST CATEGORY
    await getRooms();

    async function getRooms() {
        try {
            const res = await $.ajax({
                url: GET_ROOMS,
                type: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                contentType: "application/json",
                beforeSend: function () {
                    $(".main-content").css("display", "none");
                    $(".loading").css("display", "block");
                }
            });
            if (res && res.length > 0) {
                cateList = res;
                renderListRoom(res);
                $(".loading").css("display", "none");
                $(".main-content").css("display", "block");

            }
        } catch (e) {
            console.log(e);
            $(".main-layout").css("display", "none");
            $(".notfound").css("display", "block");
        }
    }

    function renderListRoom(roomList) {
        var cateHtml = `<option value="${0}" selected>Choose the room</option>`;
        
        for (var i = 0; i < roomList.length; i++) {
            if (roomList[i].id === editRecord.roomId) {
                cateHtml += `
                <option value="${roomList[i].id}" selected>${roomList[i].name}</option>
                `;
            }
            else {
                cateHtml += `
                <option value="${roomList[i].id}">${roomList[i].name}</option>
                `;
            }
        }
        $("#room").append(cateHtml);

    }
   


    //ADD NEW
 
    $(".btn-update").click(async function () {
        await getUpdatedRecord();
    });


    async function getUpdatedRecord() {
        //images
        newRecord.Images.push(editRecord.image);
        //name
        var name = $("#record-name").val();
        var roomId = $("#room").val();
        var phoneNumber = $("#phoneNumber").val();
        var email = $("#email").val();
        var address = $("#address").val();
        var country = $("#country").val();

        //description
        var comment = editor.getData();

        //Map
        newRecord.FullName = name;
        newRecord.RoomId = roomId;
        newRecord.PhoneNumber = phoneNumber;
        newRecord.Email = email;
        newRecord.Address = address;
        newRecord.Country = country;
        newRecord.Comment = comment;
        newRecord.isActive = $('#status-active').prop('checked');

        newRecord.CreatedBy = editRecord.createdBy;
        if (newRecord.createdBy == null) newRecord.CreatedBy = 0;

        console.log(newRecord);

        var isValid = getValidation(newRecord);
        if (!isValid.status) {
            console.log("Invalid " + isValid.message);

            $(".failed-text").text(isValid.message);
            //Toastify
            Toastify({
                node: $("#failed-notification-content").clone().removeClass("hidden")[0],
                duration: 3000,
                newWindow: true,
                close: true,
                gravity: "top",
                position: "right",
                stopOnFocus: true
            }).showToast();

            return false;
        }

        console.log("Valid");
        await putUpdatedRecord(newRecord, imgList);
        return true;


    }

    function getValidation(newRecord) {
        var validatObj = {
            name: newRecord.FullName,
        }
        for (let prop in validatObj) {
            if (validatObj[prop] == null || validatObj[prop] == '' || validatObj[prop] == undefined) {
                return {
                    status: false,
                    message: `${prop} required `
                };
            }
        }
        if (validatObj.name.length < 4 || validatObj.name.length >= 50) {
            return {
                status: false,
                message: "Checking the name field"
            }
        }
        return {
            status: true,
            message: "All valid"
        }
    }

    async function putUpdatedRecord(newRecord, imagesUpload) {
        var formData = new FormData();
        formData.append("custommerId", RECORD_ID);
        formData.append("Id", RECORD_ID);
        formData.append("FullName", newRecord.FullName);
        formData.append("Image", newRecord.Images[0]);
        if (newRecord.RoomId!=0) formData.append("RoomId", newRecord.RoomId);
        formData.append("PhoneNumber", newRecord.PhoneNumber);
        formData.append("Email", newRecord.Email);
        formData.append("Address", newRecord.Address);
        formData.append("Country", newRecord.Country);
        formData.append("Comment", newRecord.Comment);
        formData.append("IsActive", newRecord.isActive);
        formData.append("UpdatedBy", USER_ID);
        formData.append("CreatedBy", newRecord.CreatedBy);

        formData.append("images", imagesUpload[0]);
        for (var pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }
        try {
            const res = await $.ajax({
                url: PUT_RECORD,
                type: "PUT",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                data: formData,
                contentType: false,
                processData: false,
                beforeSend: function () {
                    $(".main-content").css("display", "none");
                    $(".loading").css("display", "block");
                }
            });
            $(".loading").css("display", "none");
            $(".main-content").css("display", "block");

            const myModal = tailwind.Modal.getInstance(document.querySelector("#success-modal-preview"));
            $("#success-modal-preview").on('blur', function () {
                window.location.href = '/Admin/Custommer';
            });
            myModal.show();
        } catch (e) {
            $(".loading").css("display", "none");
            $(".main-content").css("display", "block");
            const myModal = tailwind.Modal.getInstance(document.querySelector("#warning-modal-preview"));
            myModal.show();
            console.log(e);

        }
    }


});