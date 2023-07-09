﻿import { HOST } from '../env.js'
import jwt_decode from 'https://cdn.jsdelivr.net/npm/jwt-decode@3.1.2/+esm'


$(document).ready(async function () {
    //INIT
    //GET TOKEN
    var accessToken = $.cookie('AccessToken');
    var decoded = jwt_decode(accessToken);
    const USER_ID = decoded.Id;
    const GET_CATEGORIES = HOST +"/api/RoomCategory"
    var cateList = [];

    var imgList = [];
    var POST_RECORD = HOST + "/api/Room";
    var newRecord = {
        Images: [],
        Name: "",
        CategoryId: 0,
        Width: 0,
        Height: 0,
        Hight: 0,
        BedSize: "",
        Description: "",
    }

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
                $(".img-show").append(`
                    <div class="img-file col-span-5 md:col-span-2 h-28 relative image-fit cursor-pointer zoom-in">
						<img class="rounded-md" src="${e.target.result}" alt="${file.name}">
						<div title="Remove this image?"
								class="delete-file tooltip w-5 h-5 flex items-center justify-center absolute rounded-full text-white bg-danger right-0 top-0 -mr-2 -mt-2">
							<span>X</span>
						</div>
					</div>
                `);
                imgList.push(file);
                $(".delete-file").click(function () {
                    let imgName = $(this).parent(".img-file").find('img').prop("alt");
                    $(this).parent(".img-file").remove();
                    imgList = imgList.filter(function (file) {
                        return file.name != imgName;
                    })
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


    //ADD NEW

    $(".btn-addnew").click(async function () {
        await getNewRecord();
    });

    async function getNewRecord() {
        //images
        for (var i = 0; i < imgList.length; i++) {
            newRecord.Images.push(imgList[i].name);
        }
        //name
        var name = $("#record-name").val();
        var categoryId = $("#category").val();

        //room size
        var width = $("#width").val();
        var height = $("#height").val();
        var hight = $("#hight").val();
        var bedSize = $("#bedSize").val();

        //description
        var desc = editor.getData();

        newRecord.Name = name;
        newRecord.Width = width;
        newRecord.Height = height;
        newRecord.Hight = hight;
        newRecord.BedSize = bedSize;
        newRecord.Description = desc;
        newRecord.CategoryId = categoryId;

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
        await postNewRecord(newRecord, imgList);
        return true;


    }

    function getValidation(newRecord) {
        var validatObj = {
            name: newRecord.Name,
            width: newRecord.Width,
            height: newRecord.Height,
            hight: newRecord.Hight,
            bedSize: newRecord.BedSize,
            categoryId: newRecord.CategoryId,
        }
        for (let prop in validatObj) {
            if (validatObj[prop] == null || validatObj[prop] == '' || validatObj[prop] == undefined) {
                return {
                    status: false,
                    message: `${prop} required `
                };
            }
        }
        if (validatObj.name.length < 5 || validatObj.name.length >= 30) {
            return {
                status: false,
                message: "Checking the name field"
            }
        }
        if (validatObj.categoryId == 0) {
            return {
                status: false,
                message: "Category is required"
            };
        }
        if (validatObj.width < 0 || validatObj.width > 100) {
            return {
                status: false,
                message: "Checking the width field"
            }
        }
        if (validatObj.height < 0 || validatObj.height > 100) {
            return {
                status: false,
                message: "Checking the height field"
            }
        }
        if (validatObj.hight < 0 || validatObj.hight > 10) {
            return {
                status: false,
                message: "Checking the hight field"
            }
        }
        if (validatObj.bedSize.length < 3 || validatObj.bedSize.length >= 30) {
            return {
                status: false,
                message: "Checking the bedSize field"
            }
        }
        return {
            status: true,
            message: "All valid"
        }
    }

    async function postNewRecord(newRecord, imagesUpload) {
        var formData = new FormData();
        formData.append("Name", newRecord.Name);
        for (var i = 0; i < newRecord.Images.length; i++) {
            formData.append("Images", newRecord.Images[i]);
        }
        formData.append("CategoryId", newRecord.CategoryId);
        formData.append("Width", newRecord.Width);
        formData.append("Height", newRecord.Height);
        formData.append("Hight", newRecord.Hight);
        formData.append("BedSize", newRecord.BedSize);
        formData.append("Description", newRecord.Description);
        formData.append("CreatedBy", USER_ID);
        for (var i = 0; i < imagesUpload.length; i++) {
            formData.append("images", imagesUpload[i]);
        }
        for (var pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }
        try {
            const res = await $.ajax({
                url: POST_RECORD,
                type: "POST",
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
            if (res && res.length > 0) {
                console.log(res);
                $(".loading").css("display", "none");
                $(".main-content").css("display", "block");

                const myModal = tailwind.Modal.getInstance(document.querySelector("#success-modal-preview"));
                $("#success-modal-preview").on('blur', function () {
                    window.location.href = '/Admin/Accommodation/Room';
                });
                myModal.show();
            }
        } catch (e) {
            $(".loading").css("display", "none");
            $(".main-content").css("display", "block");
            const myModal = tailwind.Modal.getInstance(document.querySelector("#warning-modal-preview"));
            myModal.show();
            console.log(e);

        }
    }


    //GET LIST CATEGORY
    await getCategories();

    async function getCategories() {
        try {
            const res = await $.ajax({
                url: GET_CATEGORIES,
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
                renderListCategory(res);
                $(".loading").css("display", "none");
                $(".main-content").css("display", "block");

            }
        } catch (e) {
            console.log(e);
            $(".main-layout").css("display", "none");
            $(".notfound").css("display", "block");
        }
    }

    function renderListCategory(catepList) {
        var cateHtml = "";
        for (var i = 0; i < catepList.length; i++) {
            cateHtml += `
                <option value="${catepList[i].id}">${catepList[i].name}</option>
            `;
        }
        $("#category").append(cateHtml);

    }


});