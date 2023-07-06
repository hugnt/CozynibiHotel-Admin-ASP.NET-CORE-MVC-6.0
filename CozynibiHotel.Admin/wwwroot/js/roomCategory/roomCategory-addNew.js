import { HOST } from '../env.js'
import jwt_decode from 'https://cdn.jsdelivr.net/npm/jwt-decode@3.1.2/+esm'


$(document).ready(async function () {
    //INIT
    //GET TOKEN
    var accessToken = $.cookie('AccessToken');
    var decoded = jwt_decode(accessToken);
    const USER_ID = decoded.Id;

    var imgList = [];
    var GET_EQUIPMENT = HOST + "/api/Equipment";
    var POST_RECORD = HOST + "/api/RoomCategory";
    var newRecord = {
        Images: [],
        Name: "",
        Area: 0,
        Hight: 0,
        BedSize: "",
        Description: "",
        Equipments: []
    }

    var equipList = [];

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

    var equipmentselect = new TomSelect('#equipment-select', {
        options: [

        ],
        plugins: {
            dropdown_input: {},
            remove_button: {
                title: 'remove this item',
            }
        },
        persist: false,
        create: true,
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



    //GET LIST EQUIPMENT

    await getListEquipment();

    async function getListEquipment() {
        try {
            const res = await $.ajax({
                url: GET_EQUIPMENT,
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
                equipList = res;
                renderListEquipment(equipList);
                $(".loading").css("display", "none");
                $(".main-content").css("display", "block");
               
            }
        } catch (e) {
            console.log(e);
            $(".main-layout").css("display", "none");
            $(".notfound").css("display", "block");
        }
    }

    function renderListEquipment(equipList) {
        for (var i = 0; i < equipList.length; i++) {
            equipmentselect.addOption({ value: `${equipList[i].name}`, text: `${equipList[i].name}` });
        }

    }


    //ADD NEW
    $("#editor").click(function () {
        equipmentselect.setValue("");
    });

    $(".btn-addnew").click(async function () {
        await getNewRecord();
    });

    async function getNewRecord() {
        //images

        //name
        var name = $("#record-name").val();

        //room size
        var area = $("#area").val();
        var hight = $("#hight").val();
        var bedSize = $("#bedSize").val();

        //description
        var desc = editor.getData();


        //equipment
        var equipSelected = equipmentselect.getValue();
        for (var i = 0; i < imgList.length; i++) {
            newRecord.Images.push(imgList[i].name);
        }
        newRecord.Name = name;
        newRecord.Area = area;
        newRecord.Hight = hight;
        newRecord.BedSize = bedSize;
        newRecord.Description = desc;
        newRecord.Equipments = equipSelected;

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
            images: newRecord.Images,
            name: newRecord.Name,
            area: newRecord.Area,
            hight: newRecord.Hight,
            bedSize: newRecord.BedSize
        }
        for (let prop in validatObj) {
            if (validatObj[prop] == null || validatObj[prop] == '' || validatObj[prop] == undefined) {
                return {
                    status: false,
                    message: `${prop} required `
                };
            }
        }
        if (validatObj.images.length == 0) {
            return {
                status: false,
                message: "Some images are required "
            };
        }
        if (validatObj.name.length < 5 || validatObj.name.length >= 30) {
            return {
                status: false,
                message: "Checking the name field"
            }
        }
        if (validatObj.area < 0 || validatObj.area > 100) {
            return {
                status: false,
                message: "Checking the area field"
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
        formData.append("Area", newRecord.Area);
        formData.append("Hight", newRecord.Hight);
        formData.append("BedSize", newRecord.BedSize);
        formData.append("Description", newRecord.Description);
        formData.append("CreatedBy", USER_ID);
        for (var i = 0; i < newRecord.Equipments.length; i++) {
            formData.append("Equipments", newRecord.Equipments[i]);
        }
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
                    window.location.href = '/Admin/Accommodation/RoomCategory';
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

});