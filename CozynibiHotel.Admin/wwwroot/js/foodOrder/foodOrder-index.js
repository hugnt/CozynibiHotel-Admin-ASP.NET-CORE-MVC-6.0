import { lucide } from '../icons.js'
import { HOST, GET_IMAGE_URL } from '../env.js'
const { jsPDF } = window.jspdf
$(document).ready(async function () {
    var BASE_URL = HOST + "/api/FoodOrder";
    var cateList = [];
    var RECORD_ID = 0;
    //GET TOKEN
    var accessToken = $.cookie('AccessToken');


    //PAGINATION
    var pagination = {
        pageSize: 10,
        pageNumber: 1,
        skip: 0,
        recordCount: 0,
        recordShow: 0,
        totalPages: 0,

    }

    await getList();
    
    //DATA RENDERING
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
                $(".btn-print").off("click");
                $(".btn-confirm-sure").off("click");
                $(".btn-confirm").off("click");
                $(".btn-sendSMS").off("click");

                await updatePagination(pagination);
                $(".loading").css("display", "none");
                $(".main-content").css("display", "block");
            }
        } catch (e) {
            $(".main-layout").css("display", "none");
            $(".notfound").css("display", "block");
            console.log(e);
        }

    }

    async function renderListData(res) {
        $('.table-report tbody').html('');
        for (let i = 0; i < res.length; i++) {
            let cate = res[i];
            if (cate.isDeleted == true) continue;
            
            console.log(cate)
            var htmlConfirmBtn = ``;
            if (cate.isActive) {
                htmlConfirmBtn = `<a class="flex items-center mr-3 text-success">
									    ${lucide.checkSquare} Done
								    </a> `;
            }
            else {
                htmlConfirmBtn = `<button data-cate-id="${cate.id}" type="button" data-tw-toggle="modal" data-tw-target="#modal-confirm" class="btn btn-success w-24 btn-confirm" style="color:#fff">Confirm</button>`
            }
            let html = `
							<tr class="intro-x">
								<td class="w-10">FOD${cate.id}</td>
								<td>
									<a href="#" class="font-medium whitespace-nowrap" style="text-transform:capitalize">${cate.fullName}</a>
								</td>
		                        <td class="text-center">${cate.phoneNumber ? cate.phoneNumber : ""}</td>
								<td class="text-center">${cate.place ? cate.place : ""}</td>
                                <td class="text-center">${cate.eatingAt ? cate.eatingAt : ""}</td>
								<td class="table-report__action w-56">
									<div class="flex justify-center items-center">
										<a class="flex items-center mr-3 btn-edit" style="cursor:pointer;" data-cate-id="${cate.id}" onclick="window.location.href='/Admin/Menu/FoodOrder/Edit/${cate.id}';">
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
                                        <a class="flex items-center text-warning ml-3 btn-print" style="cursor:pointer"
								   	    data-tw-toggle="modal" data-tw-target="#modal-print" data-cate-id="${cate.id}">
											    ${lucide.print} Print
										   </a>
									</div>
								</td>
                                 <td class="text-center" style="display:flex;justify-content: center;">
                                    ${htmlConfirmBtn}
                                </td>
							</tr>
						`;
            $('.table-report tbody').append(html);

        }

        $(".btn-print").click(async function () {
            let id = $(this).data("cateId");
            let cate = cateList.find(x => x.id == id);
            const myModalPrint = tailwind.Modal.getInstance(document.querySelector("#modal-print"));
            if (cate) {
                let today = new Date(); 
                let dd = String(today.getDate()).padStart(2, '0'); 
                let mm = String(today.getMonth() + 1).padStart(2, '0');
                let yyyy = today.getFullYear(); 

                today = dd + '/' + mm + '/' + yyyy;
                $("#invoiceholder .invoiceInfor").html(`
                     <h1>Invoice #FOD${cate.id}</h1>
					<p>
						Issued: ${today}</br>
						Payment Due: ${today}
					</p>
                `);
                $("#invoiceholder .clientContact").html(`
                       Checkin code: ${cate.checkInCode?cate.checkInCode: ""}</br>
					   ${cate.phoneNumber ? cate.phoneNumber : ""}
                `);
                $(".clientName").text(cate.fullName);
                var htmlFoodList = ``;
                $("#invoiceholder .service").remove();
                $("#invoiceholder .footTitle").remove();
                var totalPrice = 0;
                var foodList = cate.foodList;
                for (var i = 0; i < foodList.length; i++) {
                    var food = await getFood(foodList[i].foodId);
                    var number = foodList[i].number;
                    totalPrice += food.price * number;
                    var subPrice = food.price * number;
                    htmlFoodList += `
                        <tr class="service">
							<td class="tableitem"><p class="itemtext">${food.name}</p></td>
							<td class="tableitem"><p class="itemtext">${number}</p></td>
							<td class="tableitem"><p class="itemtext">$${food.price}</p></td>
							<td class="tableitem"><p class="itemtext">$${subPrice}</p></td>
						</tr>
                    `;
                }
                htmlFoodList += `
                        <tr class="tabletitle footTitle">
							<td></td>
							<td></td>
							<td class="Rate"><h2>Total</h2></td>
							<td class="payment"><h2>$${totalPrice}</h2></td>
						</tr>
                `;
                $("#invoiceholder .headTitle").after(htmlFoodList);
                myModalPrint.show();
            }
            $(".btn-confirm-sure").click(async function () {
                
                $(".main-content").css("display", "none");
                $(".loading").css("display", "block");

                const pdfjs = document.querySelector('#invoiceholder');
                const wP = pdfjs.offsetWidth;
                const wH = pdfjs.offsetHeight;
                //html2canvas(pdfjs).then((canvas) => {
                //    let base64image = canvas.toDataURL('image/png');
                //    let pdf = new jsPDF('l', 'px', [wP, wH]);
                //    pdf.addImage(base64image, 'PNG', 0, 0, wP, wH);
                //    //pdf.save("Ok.pdf")
                //});
                try {
                    var doc = new jsPDF('l', 'px', [wP + 10, wH + 10]);
                    doc.html(pdfjs, {
                        callback: function (doc) {
                            doc.autoPrint();
                            doc.output('dataurlnewwindow');
                        }
                    });
                    $(".loading").css("display", "none");
                    $(".main-content").css("display", "block");
                    Toastify({
                        node: $("#print-success-modal").clone().removeClass("hidden")[0],
                        duration: 3000,
                        newWindow: true,
                        close: true,
                        gravity: "top",
                        position: "right",
                        stopOnFocus: true
                    }).showToast();

                    
                  
                } catch (e) {
                    const myModal = tailwind.Modal.getInstance(document.querySelector("#warning-modal-preview"));
                    myModal.show();
                    console.log(e);
                }
                
                
            });
        });

        $(".btn-details").click(async function () {
            let id = $(this).data("cateId");
            let cate = cateList.find(x => x.id == id);
            console.log(cate)
            if (cate) {         
                //informations
                $('#id').val("FOD" + cate.id);
                $('#name').val(cate.fullName);
                $('#status').val(cate.isActive ? "DONE" : "NEW");
                $('#phoneNumber').val(cate.phoneNumber);
                $('#eatingAt').val(cate.eatingAt);
                $('#checkInCode').val(cate.checkInCode);
                $('#place').val(cate.place);
                $('#note').html(cate.note);
                var foodList = cate.foodList;
                $(".foodList").html("");
                var htmlFoodList = ``;
                var totalPrice = 0;
                for (var i = 0; i < foodList.length; i++) {
                    var food = await getFood(foodList[i].foodId);
                    var number = foodList[i].number;
                    totalPrice += food.price * number;
                    htmlFoodList += `
                        <div class="col-span-6 sm:col-span-6">
							<input type="text" class="form-control" value="${food.name}" disabled>
						</div>
						<div class="col-span-3 sm:col-span-3">
							<input type="text" class="form-control" value="${food.price} $" disabled>
						</div>
						<div class="col-span-3 sm:col-span-3">
							<input type="text" class="form-control" value="${number}" disabled>
						</div>
                    `;
                }
                htmlFoodList += `
                    <div class="col-span-6 sm:col-span-6">
						<label class="form-label">&nbsp;</label>
					</div>
					<div class="col-span-3 sm:col-span-3">
						<label class="">&nbsp;</label>
					</div>
					<div class="col-span-3 sm:col-span-3">
						<input type="text" class="form-control" value="Total Price: ${totalPrice}$" disabled>
					</div>
                `;
                $(".foodList").append(htmlFoodList);
                
            }
        });

        $(".btn-confirm").click(async function () {
            let id = $(this).data("cateId");
            let cate = cateList.find(x => x.id == id);
            const myModalConfirm = tailwind.Modal.getInstance(document.querySelector("#modal-confirm"));
            
            if (cate) {
                $("#nameConfirm").val(cate.fullName);
                $("#phoneNumberConfirm").val(cate.phoneNumber);
                myModalConfirm.show();
                
                $(".btn-sendSMS").click(async function () {
                    var phoneNumber = "+84" + cate.phoneNumber.slice(1);
                    var contentMessage = $("#contentMessage").val();
                    console.log(phoneNumber+ " - " + contentMessage);
                    var content = `Dear ${cate.fullName}, ${contentMessage}`;
                    await putRecordStatus(cate.id, true);
                    await postSendSMS(phoneNumber, content);
                })
                
            };
        });

        $(".btn-delete").click(function () {
            RECORD_ID = $(this).data("cateId");
            console.log(RECORD_ID)
        });
    }

    $("#delete-confirmation-modal .btn-remove ").click(async function () {
        const PUT_RECORD = HOST + "/api/FoodOrder/" + RECORD_ID +"/" +true;
        var formData = new FormData();
        formData.append("foodOrderId", RECORD_ID);
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

    //UPDATE STATUS
    async function putRecordStatus(ID, status) {
        const PUT_RECORD = HOST + "/api/FoodOrder/" + ID + "/Status/" + status;
        var formData = new FormData();
        formData.append("foodOrderId", ID);
        formData.append("status", status);
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

    async function postSendSMS(phoneNumber, content) {
        var SMS = {
            phoneNumber: phoneNumber,
            content: content
        };
        try {
            const res = await $.ajax({
                url: HOST + "/api/SMS",
                type: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                contentType: "application/json",
                data: JSON.stringify(SMS),
                beforeSend: function () {
                    $(".main-content").css("display", "none");
                    $(".loading").css("display", "block");
                }
            });
            console.log(res);
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

    async function getFood(foodId) {
        try {
            const res = await $.ajax({
                url: HOST + "/api/Food/" + foodId,
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



});