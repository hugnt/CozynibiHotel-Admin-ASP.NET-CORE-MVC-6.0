import { HOST } from '../env.js'
import jwt_decode from 'https://cdn.jsdelivr.net/npm/jwt-decode@3.1.2/+esm'


$(document).ready(async function () {
    //INIT
    //GET TOKEN
    var accessToken = $.cookie('AccessToken');
    var decoded = jwt_decode(accessToken);
    const USER_ID = decoded.Id;
    const GET_PAGES = HOST +"/api/Page"
    var cateList = [];

    var POST_RECORD = HOST + "/api/Article";
    var newRecord = {
        Title: "",
        SubTitle: "",
        PageId: 0,
        Content: "",
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
        var pageId = $("#page").val();
        var subTitle = $("#subTitle").val();

        //description
        var content = editor.getData();

        //Map
        newRecord.Title = name;
        newRecord.PageId = pageId;
        newRecord.SubTitle = subTitle;
        newRecord.Content = content;
        
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
            name: newRecord.Title,
        }
        for (let prop in validatObj) {
            if (validatObj[prop] == null || validatObj[prop] == '' || validatObj[prop] == undefined) {
                return {
                    status: false,
                    message: `${prop} required `
                };
            }
        }
        if (validatObj.name.length < 4 || validatObj.name.length >= 200) {
            return {
                status: false,
                message: "Checking the title field"
            }
        }
        return {
            status: true,
            message: "All valid"
        }
    }

    async function postNewRecord(newRecord) {
        var formData = new FormData();
        formData.append("Title", newRecord.Title);
        if (newRecord.PageId != 0) formData.append("PageId", newRecord.PageId);
        formData.append("SubTitle", newRecord.SubTitle);
        formData.append("Content", newRecord.Content);
        formData.append("CreatedBy", USER_ID);
       
        
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
                    window.location.href = '/Admin/Article';
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
    await getPages();

    async function getPages() {
        try {
            const res = await $.ajax({
                url: GET_PAGES,
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
                renderListPage(res);
                $(".loading").css("display", "none");
                $(".main-content").css("display", "block");

            }
        } catch (e) {
            console.log(e);
            $(".main-layout").css("display", "none");
            $(".notfound").css("display", "block");
        }
    }

    function renderListPage(pageList) {
        var cateHtml = `<option value="${0}" selected>Choose the page</option>`;
        for (var i = 0; i < pageList.length; i++) {
            cateHtml += `
                <option value="${pageList[i].id}">${pageList[i].name}</option>
            `;
        }
        $("#page").append(cateHtml);

    }


});