import { HOST, GET_IMAGE_URL } from '../env.js'
import jwt_decode from 'https://cdn.jsdelivr.net/npm/jwt-decode@3.1.2/+esm'


$(document).ready(async function () {
    $(".loading").css("display", "none");
    $(".main-content").css("display", "block");

    //GET TOKEN
    var accessToken = $.cookie('AccessToken');

    var decoded = jwt_decode(accessToken);
    const USER_ID = decoded.Id;

    const GET_RECORD = HOST + "/api/Information/";
    const PUT_RECORD = HOST + "/api/Information/Update";
    //INIT


    var newRecord = {
        id:1,
        phoneNumber: "",
        email: "",
        site: "",
        address: "",
        googleMapLink: "",
        facebook: "",
        facebookLink: "",
        instar: "",
        instarLink: "",
        twister: "",
        twisterLink: "",
        youtube: "",
        youtubeLink: "",
        name: "",
        slogan: "",
        logo: "",
        description:"",
  
    }

    var editRecord = {};



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
                renderRecord(editRecord);

            }
        } catch (e) {
            console.log(e);
            $(".main-layout").css("display", "none");
            $(".notfound").css("display", "block");
        }

    }

    function renderRecord(res) {
        $("#inforFacebook").val(res.facebook);
        $("#inforInstar").val(res.instar);
        $("#inforTwitter").val(res.twister);
        $("#inforYoutube").val(res.youtube);

        $("#infor-facebookLink").val(res.facebookLink);
        $("#infor-instarLink").val(res.instarLink);
        $("#infor-twitterLink").val(res.twisterLink);
        $("#infor-youtubeLink").val(res.youtubeLink);

        $("#phoneNumber").val(res.phoneNumber);
        $("#email").val(res.email);
        $("#website").val(res.site);
        $("#address").val(res.address);
        $("#googleMap").val(res.googleMapLink);
        $(".gg-map").prop("src", res.googleMapLink)


    }

    $("#googleMap").change(function () {
        $(".gg-map").prop("src", $("#googleMap").val());
    })


    //ADD NEW

    $(".btn-update").click(async function () {
        await getUpdatedRecord();
    });


    async function getUpdatedRecord() {
        newRecord.phoneNumber = $("#phoneNumber").val();
        newRecord.email = $("#email").val();
        newRecord.site = $("#website").val();
        newRecord.address = $("#address").val();
        newRecord.googleMapLink = $("#googleMap").val();

        newRecord.facebook = $("#inforFacebook").val();
        newRecord.facebookLink = $("#infor-facebookLink").val();

        newRecord.instar = $("#inforInstar").val();
        newRecord.instarLink = $("#infor-instarLink").val();

        newRecord.twister = $("#inforTwitter").val();
        newRecord.twisterLink = $("#infor-twitterLink").val();

        newRecord.youtube = $("#inforYoutube").val();
        newRecord.youtubeLink = $("#infor-youtubeLink").val();

        newRecord.name = editRecord.name;
        newRecord.slogan = editRecord.slogan;
        newRecord.logo = editRecord.logo;
        newRecord.description = editRecord.description;

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
            address: newRecord.address,
            phoneNumber: newRecord.phoneNumber,
            email: newRecord.email
        }
        for (let prop in validatObj) {
            if (validatObj[prop] == null || validatObj[prop] == '' || validatObj[prop] == undefined) {
                return {
                    status: false,
                    message: `${prop} required `
                };
            }
        }
        return {
            status: true,
            message: "All valid"
        }
    }

    async function putUpdatedRecord(newRecord) {
   
        try {
            const res = await $.ajax({
                url: PUT_RECORD,
                type: "PUT",
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