import { HOST } from '../env.js'
import jwt_decode from 'https://cdn.jsdelivr.net/npm/jwt-decode@3.1.2/+esm'


$(document).ready(async function () {
    //INIT
    $(".loading").css("display", "none");
    $(".main-content").css("display", "block");
    //GET TOKEN
    var accessToken = $.cookie('AccessToken');
    var decoded = jwt_decode(accessToken);
    const USER_ID = decoded.Id;
    var cateList = [];

    var imgList = [];
    var POST_RECORD = HOST + "/api/Contact";
    var newRecord = {
        fullName: "",
        phoneNumber: "",
        email: "",
        address: "",
        comments: "",
        title: "",
        createdBy:0,
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



    //ADD NEW

    $(".btn-addnew").click(async function () {
        await getNewRecord();
    });

    async function getNewRecord() {
    
        //name
        var name = $("#record-name").val();
        var phoneNumber = $("#phoneNumber").val();
        var email = $("#email").val();
        var address = $("#address").val();
        var title = $("#title").val();
        
        //description
        var comment = editor.getData();

        //Map
        newRecord.fullName = name;
        newRecord.phoneNumber = phoneNumber;
        newRecord.email = email;
        newRecord.address = address;
        newRecord.title = title;
        newRecord.comments = comment;
        newRecord.createdBy = USER_ID;
        

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
        await postNewRecord(newRecord);
        return true;


    }

    function getValidation(newRecord) {
        var validatObj = {
            name: newRecord.fullName,
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

    async function postNewRecord(newRecord) {
        try {
            const res = await $.ajax({
                url: POST_RECORD,
                type: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                contentType: "application/json",
                data: JSON.stringify(newRecord),
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
                    window.location.href = '/Admin/ContactAndBooing/Contact';
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