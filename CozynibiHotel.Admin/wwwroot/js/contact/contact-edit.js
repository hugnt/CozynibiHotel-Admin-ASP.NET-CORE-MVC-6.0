import { HOST, GET_IMAGE_URL } from '../env.js'
import jwt_decode from 'https://cdn.jsdelivr.net/npm/jwt-decode@3.1.2/+esm'


$(document).ready(async function () {
    //GET TOKEN
    var accessToken = $.cookie('AccessToken');

    var decoded = jwt_decode(accessToken);
    const USER_ID = decoded.Id;
    

    //INIT

    var currentUrl = window.location.href;
    const RECORD_ID = currentUrl.split('/').pop();

    const GET_RECORD = HOST + "/api/Contact/" + RECORD_ID;
    const PUT_RECORD = HOST + "/api/Contact/" + RECORD_ID;


    var newRecord = {
        FullName: "",
        PhoneNumber: "",
        Email: "",
        Address: "",
        Title: "",
        Comments:"",
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

        //name
        $("#record-name").val(record.fullName);

        $("#phoneNumber").val(record.phoneNumber);
        $("#email").val(record.email);
        $("#address").val(record.address);
        $("#title").val(record.title);

        //comment
        if (record.comments) {
            editor.setData(record.comments);
        }
   

    }



    //ADD NEW
 
    $(".btn-update").click(async function () {
        await getUpdatedRecord();
    });


    async function getUpdatedRecord() {
        //name
        var name = $("#record-name").val();
        var phoneNumber = $("#phoneNumber").val();
        var email = $("#email").val();
        var address = $("#address").val();
        var title = $("#title").val();

        //description
        var comment = editor.getData();

        //Map
        newRecord.FullName = name;
        newRecord.PhoneNumber = phoneNumber;
        newRecord.Email = email;
        newRecord.Address = address;
        newRecord.Title = title;
        newRecord.Comments = comment;
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
        await putUpdatedRecord(newRecord);
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

    async function putUpdatedRecord(newRecord) {
        var formData = new FormData();
        formData.append("contactId", RECORD_ID);
        formData.append("Id", RECORD_ID);
        formData.append("FullName", newRecord.FullName);
        formData.append("PhoneNumber", newRecord.PhoneNumber);
        formData.append("Email", newRecord.Email);
        formData.append("Address", newRecord.Address);
        formData.append("Comments", newRecord.Comments);
        formData.append("Title", newRecord.Title);
        formData.append("IsActive", newRecord.isActive);
        formData.append("UpdatedBy", USER_ID);
        formData.append("CreatedBy", newRecord.CreatedBy);
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
                window.location.href = '/Admin/Contact';
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