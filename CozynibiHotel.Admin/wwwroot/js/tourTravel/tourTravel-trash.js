﻿import { lucide } from '../icons.js'
import { HOST, GET_IMAGE_URL } from '../env.js'


$(document).ready(async function () {
    var BASE_URL = HOST + "/api/TourTravel";
    var CATEGORY_IMG_SRC = GET_IMAGE_URL + "tour_travel_2"
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
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                contentType: "application/json",
                beforeSend: function () {
                    $(".loading").css("display", "block");
                    $(".main-content").css("display", "none");
                }
            });
            if (res && res.length > 0) {
                cateList = [];
                for (var i = 0; i < res.length; i++) {
                    if (res[i].isDeleted == true) {
                        cateList.push(res[i]);
                    }
                }
                updatePagination(pagination);
                $(".loading").css("display", "none");
                $(".main-content").css("display", "block");
            }
        } catch (e) {
            $(".main-layout").css("display", "none");
            $(".notfound").css("display", "block");
        }

    }

    function renderListData(res) {
        $('.table-report tbody').html('');
        for (let i = 0; i < res.length; i++) {
            let cate = res[i];
            if (cate.isDeleted == false) continue;
            let imgHtml = "";
            console.log(cate)
            for (let j = 0; j < cate.tourGalleries.length; j++) {
                let img = cate.tourGalleries[j];
                let imgString = `${CATEGORY_IMG_SRC}/${img}`;
                if (j == 0) {
                    imgHtml += `<div class="w-10 h-10 image-fit zoom-in">
									<img alt="img" class="tooltip rounded-full"
									src="${imgString}" title="img">
								</div>`
                }
                else {
                    imgHtml += `<div class="w-10 h-10 image-fit zoom-in -ml-5">
									<img alt="img" class="tooltip rounded-full"
									src="${imgString}" title="img">
								</div>`
                }

            }
            let status = "";
            let html = `
							<tr class="intro-x">
                                <td class="w-10">
							        <input class="form-check-input check-item checkBox-${cate.id}" data-id="${cate.id}" type="checkbox">
						        </td>
								<td class="w-10">T${cate.id}</td>
								<td>
									<a href="#" class="font-medium whitespace-nowrap" style="text-transform:capitalize">${cate.name}</a>
								</td>
								<td class="w-40">
									<div class="flex justify-center">`
                +
                imgHtml
                +
                `
							</div>
								</td>
								<td class="table-report__action w-56">
							        <div class="flex justify-center items-center">
								        <a class="flex items-center mr-3 text-danger btn-delete" data-id="${cate.id}" href="javascript:;" data-tw-toggle="modal" data-tw-target="#delete-confirmation-modal">
									        ${lucide.xCircle} Delete
								        </a>
								        <a class="flex items-center text-primary btn-restore" data-id="${cate.id}" href="javascript:;">
									         ${lucide.rotateCcw} Restore
								        </a>
							        </div>
						        </td>
							</tr>
						`;
            $('.table-report tbody').append(html);
        }

        $(".check-all").change(function () {
            $(".check-item").prop("checked", $(this).is(':checked'));
           
        });

        $(".btn-delete").click(function () {
            $(`.checkBox-${$(this).data("id")}`).prop("checked", true);
            
        });

        $(".btn-restore").click(async function () {
            await putRecordStatus($(this).data("id"))
        });

    }

    $("#delete-confirmation-modal .btn-remove").click(async function () {
        
        $(".check-item:checked").map(async function () {
            await deleteRecord($(this).data("id"));
        });
    });

    $(".btn-multi-restore").click(function () {
        $(".check-item:checked").map(async function () {
            await putRecordStatus($(this).data("id"));
        });
    });

    $(".btn-multi-delete").click(function () {
        if ($(".check-item:checked").length == 0) {
            console.log("NO CONTENT")
            const myModalDel = tailwind.Modal.getInstance(document.querySelector("#delete-confirmation-modal"));
            myModalDel.hide();
        }
        else {
            const myModalDel = tailwind.Modal.getInstance(document.querySelector("#delete-confirmation-modal"));
            myModalDel.show();
        }
    });

    async function putRecordStatus(ID) {
        const PUT_RECORD = HOST + "/api/TourTravel/" + ID + "/" + false;
        var formData = new FormData();
        formData.append("tourTravelId", ID);
        formData.append("isDelete", false);
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
            Toastify({
                node: $("#restore-success-modal").clone().removeClass("hidden")[0],
                duration: 3000,
                newWindow: true,
                close: true,
                gravity: "top",
                position: "right",
                stopOnFocus: true
            }).showToast();

            await getList();

        } catch (e) {
            $(".loading").css("display", "none");
            $(".main-content").css("display", "block");
            const myModal = tailwind.Modal.getInstance(document.querySelector("#warning-modal-preview"));
            myModal.show();
            console.log(e);

        }
    }

    async function deleteRecord(ID) {
        const DELETE_RECORD = HOST + "/api/TourTravel/" + ID;
        try {
            const res = await $.ajax({
                url: DELETE_RECORD,
                type: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
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
            Toastify({
                node: $("#delete-success-modal").clone().removeClass("hidden")[0],
                duration: 3000,
                newWindow: true,
                close: true,
                gravity: "top",
                position: "right",
                stopOnFocus: true
            }).showToast();

            await getList();

        } catch (e) {
            const myModalDel = tailwind.Modal.getInstance(document.querySelector("#delete-confirmation-modal"));
            myModalDel.hide();
            $(".loading").css("display", "none");
            $(".main-content").css("display", "block");
            const myModal = tailwind.Modal.getInstance(document.querySelector("#warning-modal-preview"));
            myModal.show();
            console.log(e);

        }
    }

    //PAGINATION HANDLING

    function updatePagination(pagination) {
        pagination.pageSize = parseInt($(".pageSize-select").val()); //records per view
        pagination.skip = pagination.pageNumber * pagination.pageSize - pagination.pageSize; // skip to move to next 5 recordds

        //show
        pagination.recordCount = cateList.length;
        pagination.recordShow = cateList.slice(pagination.skip, pagination.skip + pagination.pageSize);
        pagination.totalPages = Math.ceil(pagination.recordCount / pagination.pageSize);

        renderListData(pagination.recordShow);
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
        $(".page-number").click(function () {
            $(".page-number").removeClass("active");
            $(this).addClass("active");
            pagination.pageNumber = $(this).find('a').data('pageNumber');
            updatePagination(pagination);
        });
        $(".next-page").click(function () {
            pagination.pageNumber += 1;
            let activePage = $(".active.page-number");
            $(".page-number").removeClass("active");
            activePage.next(".page-number").addClass("active");
            updatePagination(pagination);
        });
        $(".prev-page").click(function () {
            pagination.pageNumber -= 1;
            let activePage = $(".active.page-number");
            $(".page-number").removeClass("active");
            activePage.prev(".page-number").addClass("active");
            updatePagination(pagination);
        });
        $(".pageSize-select").change(function () {
            pagination.pageNumber = parseInt("1");
            pagination.pageSize = $(".pageSize-select").val();
            updatePagination(pagination);

        });
    }

    function destroyPaginationEvents() {
        $(".page-number").off("click");
        $(".next-page").off("click");
        $(".prev-page").off("click");
        $(".pageSize-select").off("change");
    }


    //TOOL 

    async function searchFor(field, keyWords) {
        try {
            const res = await $.ajax({
                url: `${BASE_URL}/${field}/${keyWords}`,
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
                cateList = [];
                for (var i = 0; i < res.length; i++) {
                    if (res[i].isDeleted == true) {
                        cateList.push(res[i]);
                    }
                }
                updatePagination(pagination);
                $(".loading").css("display", "none");
                $(".main-content").css("display", "block");
                console.log(res);
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
        if (keyWords == null || keyWords == "") keyWords = "*";
        if (field == null || field == "") field = "name";
        await searchFor(field, keyWords);
    });

    $(".search-box-table").on("keypress keydown", function (event) {
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
    }


});