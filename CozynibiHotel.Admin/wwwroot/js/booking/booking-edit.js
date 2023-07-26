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

    const GET_RECORD = HOST + "/api/Booking/" + RECORD_ID;
    const PUT_RECORD = HOST + "/api/Booking/" + RECORD_ID;
    const POST_CUSTOMMER = HOST + "/api/Custommer";
    const GET_ROOMS = HOST + "/api/Room";
    var roomList = [];
    const modalConfirm = tailwind.Modal.getOrCreateInstance(document.querySelector("#modal-confirm"));

    var newRecord = {
        FullName: "",
        PhoneNumber: "",
        Email: "",
        Address: "",
        Adults: "",
        Children: "",
        CheckIn: "",
        CheckOut: "",
        Content: "",
        CheckInCode:"",
        isSuccess: false,
        isConfirm: false,
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

    //STATUS
    $("#status-confirm").change(function () {
        if ($(this).prop('checked')) {
            $('#nameConfirm').val(editRecord.fullName);
            $('#emailConfirm').val(editRecord.email);
            $('#phoneNumberConfirm').val(editRecord.phoneNumber);
            $('#checkInConfirm').val(editRecord.checkIn);
            $('#checkOutConfirm').val(editRecord.checkOut);
            modalConfirm.show();
            $("#status-confirm").prop('checked', false);
            $(".btn-confirm-sure").click(async function () {
                var confirmBooking = await putConfirmBooking(editRecord.id);
                if (confirmBooking) {
                    $("#status-confirm").prop('checked', true);
                    $(".btn-getNewCode").prop("disabled", false);
                    $('#status-takeRoom').prop('disabled', false);
                }
            });
        }
        else {
            $(".btn-getNewCode").prop("disabled", true);
            $('#status-takeRoom').prop('checked', false);
            $('#status-takeRoom').prop('disabled', true);
            
        }
    });
    const TakeRoomModal = document.getElementById('modal-takeRoom')
    TakeRoomModal.addEventListener('hidden.tw.modal', function (event) {
        $("#status-takeRoom").prop('checked', false);
    });

    $("#status-takeRoom").change(function () {
        if ($(this).prop('checked')) {
            $('#nameTakeRoom').val(editRecord.fullName);
            $('#checkInCodeTakeRoom').val(editRecord.checkInCode);
            $('#checkInTakeRoom').val(editRecord.checkIn);
            $('#checkOutTakeRoom').val(editRecord.checkOut);
            const myModalTakeRoom = tailwind.Modal.getInstance(document.querySelector("#modal-takeRoom"));
            myModalTakeRoom.show();
            $(".btn-addCustommer").click(async function () {
                myModalTakeRoom.hide();
                editRecord.roomId = $("#room").val();
                var postCustommer = await postNewRecord(editRecord);
                if (postCustommer) {
                    await putRecordSuccess(editRecord.id, true);
                    $('#status-takeRoom').prop('checked', true);
                }
            });
        }
        else {

        }
    });

    $(".btn-getNewCode").click(function () {
        $('#nameConfirm').val(editRecord.fullName);
        $('#emailConfirm').val(editRecord.email);
        $('#phoneNumberConfirm').val(editRecord.phoneNumber);
        $('#checkInConfirm').val(editRecord.checkIn);
        $('#checkOutConfirm').val(editRecord.checkOut);
        modalConfirm.show();
        $(".btn-confirm-sure").click(async function () {
            var confirmBooking = await putConfirmBooking(editRecord.id);
            if (confirmBooking) {
                $("#status-confirm").prop('checked', true);
                $(".btn-getNewCode").prop("disabled", false);
                $('#status-takeRoom').prop('disabled', false);
            }
        });
    });

    async function putConfirmBooking(ID) {
        const PUT_CONFIRM = HOST + "/api/Booking/ConfirmBooking/" + ID;
        try {
            const res = await $.ajax({
                url: PUT_CONFIRM,
                type: "PUT",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                beforeSend: function () {
                    $(".main-content").css("display", "none");
                    $(".loading").css("display", "block");
                }
            });

            $(".loading").css("display", "none");
            $(".main-content").css("display", "block");
            Toastify({
                node: $("#confirm-success-modal").clone().removeClass("hidden")[0],
                duration: 3000,
                newWindow: true,
                close: true,
                gravity: "top",
                position: "right",
                stopOnFocus: true
            }).showToast();
            await getDetails();
            return true;

        } catch (e) {
            $(".loading").css("display", "none");
            $(".main-content").css("display", "block");
            const myModal = tailwind.Modal.getInstance(document.querySelector("#warning-modal-preview"));
            myModal.show();
            console.log(e);
            return false;

        }
    }

    async function postNewRecord(newRecord) {
        var formData = new FormData();
        formData.append("FullName", newRecord.fullName);
        if (newRecord.roomId != 0) formData.append("RoomId", newRecord.roomId);
        formData.append("PhoneNumber", newRecord.phoneNumber);
        formData.append("Email", newRecord.email);
        formData.append("Address", newRecord.address);
        formData.append("CheckInCode", newRecord.checkInCode);
        formData.append("CreatedBy", USER_ID);


        for (var pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }
        try {
            const res = await $.ajax({
                url: POST_CUSTOMMER,
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
                Toastify({
                    node: $("#takeRoom-success-modal").clone().removeClass("hidden")[0],
                    duration: 3000,
                    newWindow: true,
                    close: true,
                    gravity: "top",
                    position: "right",
                    stopOnFocus: true
                }).showToast();

                return true;
            }
        } catch (e) {
            $(".loading").css("display", "none");
            $(".main-content").css("display", "block");
            const myModalWarning = tailwind.Modal.getInstance(document.querySelector("#warning-modal-preview"));
            myModalWarning.show();
            console.log(e);
            return false;

        }
    }

    async function putRecordSuccess(ID, status) {
        const PUT_RECORD = HOST + "/api/Booking/" + ID + "/TakeRoom/" + status;
        var formData = new FormData();
        formData.append("bookingId", ID);
        formData.append("isSuccess", status);
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

            await getDetails();

        } catch (e) {
            $(".loading").css("display", "none");
            $(".main-content").css("display", "block");
            const myModal = tailwind.Modal.getInstance(document.querySelector("#warning-modal-preview"));
            myModal.show();
            console.log(e);

        }
    }

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
        if (record.isConfirm == true) {
            $('#status-confirm').prop('checked', true);
            $(".btn-getNewCode").prop("disabled", false);
        }
        else {
            $('#status-confirm').prop('checked', false);
            $('#status-takeRoom').prop('disabled', true);
        }
        if (record.isSuccess == true) {
            $('#status-takeRoom').prop('checked', true);
        }
        else {
            $('#status-takeRoom').prop('checked', false);
        }
        $("#checkInCode").val(record.checkInCode);

        //name
        $("#record-name").val(record.fullName);

        $("#phoneNumber").val(record.phoneNumber);
        $("#email").val(record.email);
        $("#address").val(record.address);
        $("#adults").val(record.adults);
        $("#children").val(record.children);
        $("#checkIn").val(record.checkIn);
        $("#checkOut").val(record.checkOut);

        //comment
        if (record.content) {
            editor.setData(record.content);
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
        var adults = $("#adults").val();
        var children = $("#children").val();
        var checkIn = $("#checkIn").val();
        var checkInCode = $("#checkInCode").val();
        var checkOut = $("#checkOut").val();

        //description
        var content = editor.getData();

        //Map
        newRecord.FullName = name;
        newRecord.PhoneNumber = phoneNumber;
        newRecord.Email = email;
        newRecord.Address = address;
        newRecord.Content = content;
        newRecord.Adults = adults;
        newRecord.Children = children;
        newRecord.CheckIn = checkIn;
        newRecord.CheckOut = checkOut;
        newRecord.CheckInCode = checkInCode;
        newRecord.isConfirm = $('#status-confirm').prop('checked');
        newRecord.isSuccess = $('#status-takeRoom').prop('checked');

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
        formData.append("bookingId", RECORD_ID);
        formData.append("Id", RECORD_ID);
        formData.append("FullName", newRecord.FullName);
        formData.append("PhoneNumber", newRecord.PhoneNumber);
        formData.append("Email", newRecord.Email);
        formData.append("Address", newRecord.Address);
        formData.append("Content", newRecord.Content);
        formData.append("Adults", newRecord.Adults);
        formData.append("Children", newRecord.Children);
        formData.append("CheckIn", newRecord.CheckIn);
        formData.append("CheckOut", newRecord.CheckOut);
        formData.append("Content", newRecord.Content);
        if (newRecord.CheckInCode) formData.append("CheckInCode", newRecord.CheckInCode);
        formData.append("IsConfirm", newRecord.isConfirm);
        formData.append("IsSuccess", newRecord.isSuccess);
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
                window.location.href = '/Admin/ContactAndBooking/Booking';
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

    //remder room
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
                roomList = [];
                for (var i = 0; i < res.length; i++) {
                    if (res[i].isActive != true) {
                        roomList.push(res[i]);
                    }
                }
                renderListRoom(roomList);
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
            cateHtml += `
                <option value="${roomList[i].id}">${roomList[i].name}</option>
            `;
        }
        $("#room").append(cateHtml);

    }

});