import { lucide } from '../icons.js'
import { HOST, GET_IMAGE_URL } from '../env.js'
import jwt_decode from 'https://cdn.jsdelivr.net/npm/jwt-decode@3.1.2/+esm'


$(document).ready(async function () {
    var BASE_URL = HOST + "/api/Booking";
    var cateList = [];
    var RECORD_ID = 0;
    const GET_ROOMS = HOST + "/api/Room"
    const POST_CUSTOMMER = HOST + "/api/Custommer"
    var roomList = [];
    //GET TOKEN
    var accessToken = $.cookie('AccessToken');
    var decoded = jwt_decode(accessToken);
    const USER_ID = decoded.Id;

    //PAGINATION
    var pagination = {
        pageSize: 10,
        pageNumber: 1,
        skip: 0,
        recordCount: 0,
        recordShow: 0,
        totalPages: 0,

    }

    //QR HANDLER
    async function onScanSuccess(decodedText, decodedResult) {
        console.log(`Code matched = ${decodedText}`);
        console.log(typeof decodedText)
        html5QrcodeScanner.pause();
        await postValidateQR(decodedText);
    }

    function onScanFailure(error) {
       /* console.warn(`Code scan error = ${error}`);*/
    }

    let html5QrcodeScanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },false);
    
    $(".btn-scanQR").click(function () {
        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    });

   
    const QRModal = document.getElementById('modal-qrScan')
    QRModal.addEventListener('hidden.tw.modal', function (event) {
        html5QrcodeScanner.clear();
    });


    //DATA RENDERING
    await getList();

    async function getList() {
        try {
            const res = await $.ajax({
                url: BASE_URL,
                type: "GET",
                contentType: "application/json",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                beforeSend: function () {
                    $(".loading").css("display", "block");
                    $(".main-content").css("display", "none");
                }
            });
            if (res && res.length > 0) {
                cateList = [];
                for (var i = 0; i < res.length; i++) {
                    if (res[i].isDeleted != true) {
                        cateList.push(res[i]);
                    }
                }
                await updatePagination(pagination);
                $(".loading").css("display", "none");
                $(".main-content").css("display", "block");
            }
        } catch (e) {
            $(".main-layout").css("display", "none");
            $(".notfound").css("display", "block");
        }

    }

    async function renderListData(res) {
        $('.table-report tbody').html('');
        for (let i = 0; i < res.length; i++) {
            let cate = res[i];
            if (cate.isDeleted == true) continue;
            
            console.log(cate)
            let htmlConfirmBtn = ``;
            if (cate.isConfirm) {
                htmlConfirmBtn = `<a class="flex items-center mr-3 text-success">
									    ${lucide.checkSquare} Confirmed
								    </a> `;
            }
            else {
                htmlConfirmBtn = `<button data-cate-id="${cate.id}" type="button" data-tw-toggle="modal" data-tw-target="#modal-confirm" class="btn btn-success w-24 btn-confirm" style="color:#fff">Confirm</button>`
            }
            let html = `
							<tr class="intro-x">
								<td class="w-10">B${cate.id}</td>
								<td>
									<a href="#" class="font-medium whitespace-nowrap" style="text-transform:capitalize">${cate.fullName}</a>
								</td>
								<td class="text-center">${cate.email ? cate.email : ""}</td>
                                <td class="text-center">${cate.checkIn ? cate.checkIn : ""}</td>
                                <td class="text-center">${cate.checkOut ? cate.checkOut : ""}</td>
								<td class="table-report__action w-56">
									<div class="flex justify-center items-center">
										<a class="flex items-center mr-3 btn-edit" style="cursor:pointer;" data-cate-id="${cate.id}" onclick="window.location.href='/Admin/ContactAndBooking/Booking/Edit/${cate.id}';">
											${lucide.checkSquare} Edit
										</a>
										<a class="flex items-center text-danger mr-3 btn-delete" style="cursor:pointer"
								   	data-tw-toggle="modal" data-tw-target="#delete-confirmation-modal" data-cate-id="${cate.id}">
											${lucide.trash2} Delete
										</a>
										<a class="flex items-center text-primary btn-details" data-cate-id="${cate.id}"
                                            style="cursor:pointer;" data-tw-toggle="modal" data-tw-target="#modal-details">
											${lucide.eye} Details
										</a>
									</div>
								</td>
                                <td class="text-center">
                                    ${htmlConfirmBtn}
                                </td>   
							</tr>
						`;
            $('.table-report tbody').append(html);

        }
        $(".btn-confirm").click(async function () {
            let id = $(this).data("cateId");
            let cate = cateList.find(x => x.id == id);
            if (cate) {
                $('#nameConfirm').val(cate.fullName);
                $('#emailConfirm').val(cate.email);
                $('#phoneNumberConfirm').val(cate.phoneNumber);
                $('#checkInConfirm').val(cate.checkIn);
                $('#checkOutConfirm').val(cate.checkOut);
            }
            $(".btn-confirm-sure").click(async function () {
                await putConfirmBooking(id);
            });
        });
        $(".btn-details").click(async function () {
            let id = $(this).data("cateId");
            let cate = cateList.find(x => x.id == id);
            console.log(cate)
            if (cate) {
                
                //user 
                const GET_USER1 = HOST + "/api/Account/" + cate.createdBy;
                const GET_USER2 = HOST + "/api/Account/" + cate.updatedBy;
                console.log(GET_USER1)
                const CREATED_ONE = await getUser(GET_USER1);
                const UPDATED_ONE = await getUser(GET_USER2);
              
         
                //informations
                $('#id').val("B" + cate.id);
                $('#name').val(cate.fullName);
                $('#isConfirm').val(cate.isConfirm ? "Confirmed" : "Waiting");
                $('#checkInCode').val(cate.checkInCode);
                $('#isSuccess').val(cate.isSuccess ? "YES" : "NO");
                $('#phoneNumber').val(cate.phoneNumber);
                $('#adults').val(cate.adults);
                $('#children').val(cate.children);
                $('#checkIn').val(cate.checkIn);
                $('#checkOut').val(cate.checkOut);
                $('#email').val(cate.email);
                $('#address').val(cate.address);
                $('#content').html(cate.content);
                $('#createdAt').val(cate.createdAt);
                $('#updatedAt').val(cate.updatedAt);
                if (CREATED_ONE) {
                    $('#createdBy').val(CREATED_ONE.fullName);
                }
                if (UPDATED_ONE) {
                    $('#updatedBy').val(UPDATED_ONE.fullName);
                }
          

            }
        });

       

        $(".btn-delete").click(function () {
            RECORD_ID = $(this).data("cateId");
            console.log(RECORD_ID)
        });
    }

    $("#delete-confirmation-modal .btn-remove ").click(async function () {
        const PUT_RECORD = HOST + "/api/Booking/" + RECORD_ID +"/" +true;
        var formData = new FormData();
        formData.append("bookingId", RECORD_ID);
        formData.append("isDelete", true);
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
            const myModalDel = tailwind.Modal.getInstance(document.querySelector("#delete-confirmation-modal"));
            myModalDel.hide();

            await getList();
            Toastify({
                node: $("#notice-notification-content").clone().removeClass("hidden")[0],
                duration: 3000,
                newWindow: true,
                close: true,
                gravity: "top",
                position: "right",
                stopOnFocus: true
            }).showToast();

            

        } catch (e) {
            const myModalDel = tailwind.Modal.getInstance(document.querySelector("#delete-confirmation-modal"));
            myModalDel.hide();
            $(".loading").css("display", "none");
            $(".main-content").css("display", "block");
            const myModal = tailwind.Modal.getInstance(document.querySelector("#warning-modal-preview"));
            myModal.show();
            console.log(e);

        }
    });

    //CONFIRM AND CHECKING QR

    function postAddNewCustommer(infor) {
        $('#nameTakeRoom').val(infor.fullName);
        $('#checkInCodeTakeRoom').val(infor.checkInCode);
        $('#checkInTakeRoom').val(infor.checkIn);
        $('#checkOutTakeRoom').val(infor.checkOut);
        const myModalTakeRoom = tailwind.Modal.getInstance(document.querySelector("#modal-takeRoom"));
        myModalTakeRoom.show();
        $(".btn-addCustommer").click(async function () {
            const myModalQR = tailwind.Modal.getInstance(document.querySelector("#modal-details-QR"));
            myModalQR.hide();
            myModalTakeRoom.hide();
            infor.roomId = $("#room").val();
            var postCustommer = await postNewRecord(infor);
            if (postCustommer) {
                await putRecordSuccess(infor.id, true);
            }
        });



    }

    async function putConfirmBooking(ID) {
        const PUT_RECORD = HOST + "/api/Booking/ConfirmBooking/" + ID;
        try {
            const res = await $.ajax({
                url: PUT_RECORD,
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

    async function postValidateQR(QRcode) {
        const POST_QR = HOST + "/api/Booking/ValidateQRBooking";
        var formData = new FormData();
        formData.append("qrToken", QRcode);
        for (var pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }
        try {
            const res = await $.ajax({
                url: POST_QR,
                type: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                processData: false,
                mimeType: "multipart/form-data",
                contentType: false,
                data: formData,
                beforeSend: function () {
                    $(".main-content").css("display", "none");
                    $(".loading").css("display", "block");
                }
            });
            if (res) {
                const infor = JSON.parse(res);
                console.log(res);
                $(".loading").css("display", "none");
                $(".main-content").css("display", "block");

                Toastify({
                    node: $("#qr-success-modal").clone().removeClass("hidden")[0],
                    duration: 3000,
                    newWindow: true,
                    close: true,
                    gravity: "top",
                    position: "right",
                    stopOnFocus: true
                }).showToast();

                //informations
                $('#idQR').val("B" + infor.id);
                $('#nameQR').val(infor.fullName);
                $('#isConfirmQR').val(infor.isConfirm ? "Confirmed" : "Waiting");
                $('#checkInCodeQR').val(infor.checkInCode);
                $('#isSuccessQR').val(infor.isSuccess ? "YES" : "NO");
                $('#phoneNumberQR').val(infor.phoneNumber);
                $('#adultsQR').val(infor.adults);
                $('#childrenQR').val(infor.children);
                $('#checkInQR').val(infor.checkIn);
                $('#checkOutQR').val(infor.checkOut);
                $('#emailQR').val(infor.email);
                $('#addressQR').val(infor.address);
                $('#contentQR').html(infor.content);
                const myModalQRSScan = tailwind.Modal.getInstance(QRModal);
                myModalQRSScan.hide();
                const myModalQR = tailwind.Modal.getInstance(document.querySelector("#modal-details-QR"));
                myModalQR.show();
                if (infor.isSuccess == true) {
                    $(".btn-takeRoom").prop("disabled", true);
                }
                else {
                    $(".btn-takeRoom").prop("disabled", false);
                }
                $(".btn-takeRoom").click(function () {
                    if (infor.isSuccess != true) postAddNewCustommer(infor);
                });
            }
        } catch (e) {
            $(".loading").css("display", "none");
            $(".main-content").css("display", "block");
            Toastify({
                node: $("#qr-fail-modal").clone().removeClass("hidden")[0],
                duration: 3000,
                newWindow: true,
                close: true,
                gravity: "top",
                position: "right",
                stopOnFocus: true
            }).showToast();
            html5QrcodeScanner.resume();
            console.log(e);

        }
    }

    async function postNewRecord(newRecord) {
        var formData = new FormData();
        formData.append("FullName", newRecord.fullName);
        if (newRecord.roomId != 0) formData.append("RoomId", newRecord.roomId);
        formData.append("PhoneNumber", newRecord.phoneNumber);
        formData.append("Email", newRecord.email);
        formData.append("CheckInCode", newRecord.checkInCode);
        formData.append("Address", newRecord.address);
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

            await getList();

        } catch (e) {
            $(".loading").css("display", "none");
            $(".main-content").css("display", "block");
            const myModal = tailwind.Modal.getInstance(document.querySelector("#warning-modal-preview"));
            myModal.show();
            console.log(e);

        }
    }


    //PAGINATION HANDLING

    async function updatePagination(pagination) {
        pagination.pageSize = parseInt($(".pageSize-select").val()); //records per view
        pagination.skip = pagination.pageNumber * pagination.pageSize - pagination.pageSize; // skip to move to next 5 recordds

        //show
        pagination.recordCount = cateList.length;
        pagination.recordShow = cateList.slice(pagination.skip, pagination.skip + pagination.pageSize);
        pagination.totalPages = Math.ceil(pagination.recordCount / pagination.pageSize);

        await renderListData(pagination.recordShow);
        renderPagination(pagination);
        formatPagination(pagination.pageNumber, pagination.totalPages);
        destroyPaginationEvents();
        handlePagination();
        $(".showing-page-title").text(`Showing ${pagination.skip + 1} to ${pagination.skip + pagination.recordShow.length} of ${cateList.length} entries`)
        console.log(pagination);
    }

    function formatPagination(pageNumber, totalPages) {
        if (totalPages > 3) {
            if (pageNumber <= 2) {
                $(".more-page-before").css("display", "none");
            }
            else {
                $(".more-page-before").css("display", "block");
            }
            if (pageNumber >= totalPages - 1) {
                $(".more-page-after").css("display", "none");
            }
            else {
                $(".more-page-after").css("display", "block");
            }
            for (var i = 1; i <= totalPages; i++) {
                $(`.pg-${i}`).css("display", "none");
                if (i >= pageNumber - 1 && i <= pageNumber + 1) {
                    $(`.pg-${i}`).css("display", "block");
                }
            }
        }
        else {
            $(".more-page-before").css("display", "none");
            $(".more-page-after").css("display", "none");
        }

        if (pageNumber == 1) {
            $(".prev-page").css("display", "none");
        }
        else {
            $(".prev-page").css("display", "block");
        }
        if (pageNumber == totalPages) {
            $(".next-page").css("display", "none");
        }
        else {
            $(".next-page").css("display", "block");
        }
        $(`.pg-${pageNumber}`).addClass("active");

    }

    function renderPagination(pagination) {
        $('.more-page-before').nextUntil('.more-page-after').remove();
        var paginationHtml = ``;
        for (var i = 1; i <= pagination.totalPages; i++) {
            paginationHtml += `
                <li class="page-item page-number pg-${i}">
                    <a class="page-link" data-page-number="${i}">${i}</a>
                </li>
            `;
        }

        $(".more-page-before").after(paginationHtml);
        $(`.pg-${pagination.pageNumber}`).addClass("active");
    }

    function handlePagination() {
        //handling pagination
        $(".page-number").click(async function () {
            $(".page-number").removeClass("active");
            $(this).addClass("active");
            pagination.pageNumber = $(this).find('a').data('pageNumber');
            await updatePagination(pagination);
        });
        $(".next-page").click(async function () {
            pagination.pageNumber += 1;
            let activePage = $(".active.page-number");
            $(".page-number").removeClass("active");
            activePage.next(".page-number").addClass("active");
            await updatePagination(pagination);
        });
        $(".prev-page").click(async function () {
            pagination.pageNumber -= 1;
            let activePage = $(".active.page-number");
            $(".page-number").removeClass("active");
            activePage.prev(".page-number").addClass("active");
            await updatePagination(pagination);
        });
        $(".pageSize-select").change(async function () {
            pagination.pageNumber = parseInt("1");
            pagination.pageSize = $(".pageSize-select").val();
            await updatePagination(pagination);

        });
    }

    function destroyPaginationEvents() {
        $(".page-number").off("click");
        $(".next-page").off("click");
        $(".prev-page").off("click");
        $(".pageSize-select").off("change");
    }


    //TOOL 
    function sortBy(field) {
        cateList.sort(function (a, b) {
            const A = a[field];
            const B = b[field];
            if (A < B) {
                return -1;
            }
            if (A > B) {
                return 1; 
            }
            return 0;
        });
    }
    
    $(".sortby-select").change(async function () {
        sortBy($(this).val());
        await updatePagination(pagination);
    });

    async function searchFor(field, keyWords) {
        try {
            const res = await $.ajax({
                url: `${BASE_URL}/${field}/${keyWords}`,
                type: "GET",
                contentType: "application/json",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                beforeSend: function () {
                    $(".main-content").css("display", "none");
                    $(".loading").css("display", "block");
                }
            });
            if (res && res.length > 0) {
                cateList = [];
                for (var i = 0; i < res.length; i++) {
                    if (res[i].isDeleted != true) {
                        cateList.push(res[i])
                    }
                }
                console.log(cateList)
                await updatePagination(pagination);
                $(".loading").css("display", "none");
                $(".main-content").css("display", "block");
                console.log(res);
            }
            else {
                $(".loading").css("display", "none");
                $(".cantSearch").css("display", "block");
            }
        } catch (e) {
            console.log(e);
            $(".loading").css("display", "none");
            $(".cantSearch").css("display", "block");
        }
    }

    $(".search-btn").click(async function () {
        var field = $(".filter-select").val();
        var keyWords = $(".search-box-table").val();
        if (keyWords == null || keyWords=="") keyWords = "*";
        if (field == null || field == "") field = "fullName";
        await searchFor(field, keyWords);
    });

    $(".search-box-table").on("keypress", function (event) {
        if (event.which === 13) {
            $(".search-btn").click();
        }
    });

    $(".btn-goBack").click(function () {
        $(".not-found").css("display", "none");
        $(".cantSearch").css("display", "none");
        $(".main-content").css("display", "block");
        resetToolBar();
        getList();

    });

    function resetToolBar() {
        $(".search-box-table").val("");
        $(".filter-select").find(".default").prop("selected", true);
    }

    //USER
    async function getUser(GET_USER) {
        try {
            const res = await $.ajax({
                url: GET_USER,
                type: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            if (res) {
                return res;
            }
            return null;
        } catch (e) {
            return null;
        }
    }

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