import { lucide } from '../icons.js'
import { HOST, GET_IMAGE_URL } from '../env.js'


$(document).ready(async function () {
    var BASE_URL = HOST + "/api/Gallery";
    var IMG_SRC = GET_IMAGE_URL + "gallery"
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
        $('.data-list-item').remove();
        for (let i = 0; i < res.length; i++) {
            let cate = res[i];
            if (cate.isDeleted == true) continue;

            var category = "";
            if (cate.categoryId) {
                category = await getCate(cate.categoryId);
            }

            console.log(cate)

            //IMAGE
            let imgString = `${IMG_SRC}/${cate.image}`;

            let status = "";
            if (cate.isActive) {
                status = `
							<div class="flex items-center mt-2 text-success">
								${lucide.checkSquare} Active
							</div>
						`;
            }
            else {
                status = `
                            <div class="flex items-center mt-2 text-danger">
								${lucide.checkSquare} Inactive
							</div>
						`;
            }
            let html = `
                <div class="intro-y col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3 data-list-item">
                    <div class="box">
                        <div class="p-5">
                            <div class="h-40 2xl:h-56 image-fit rounded-md overflow-hidden before:block before:absolute before:w-full before:h-full before:top-0 before:left-0 before:z-10 before:bg-gradient-to-t before:from-black before:to-black/10">
                                <img alt="" class="rounded-md" src="${imgString}">
                            </div>
                            <div class="text-slate-600 dark:text-slate-500 mt-5">
                                <div class="flex items-center"  style="overflow:hidden;"> ${lucide.link} Name: ${cate.image} </div>
                                <div class="flex items-center mt-2"> ${lucide.layers} Category: ${category ? category.name : ""} </div>
                                ${status}
                            </div>
                        </div>
                        <div class="flex justify-center lg:justify-end items-center p-5 border-t border-slate-200/60 dark:border-darkmode-400">
                            <a style="cursor:pointer;" class="btn-details flex items-center text-primary mr-auto" data-tw-toggle="modal" data-tw-target="#modal-details" data-cate-id="${cate.id}"> ${lucide.eye} Preview </a>
                            <a style="cursor:pointer;" class="btn-edit flex items-center mr-3" onclick="window.location.href='/Admin/Gallery/Edit/${cate.id}';" data-cate-id="${cate.id}"> ${lucide.checkSquare} Edit </a>
                            <a style="cursor:pointer;" class="btn-delete flex items-center text-danger" href="javascript:;" data-tw-toggle="modal" data-tw-target="#delete-confirmation-modal" data-cate-id="${cate.id}"> ${lucide.trash2} Delete </a>
                        </div>
                    </div>
                </div>
            `;
            $('.data-list-begin').after(html);

        }

        $(".btn-details").click(async function () {
            let id = $(this).data("cateId");
            let cate = cateList.find(x => x.id == id);
            console.log(cate)
            if (cate) {
                let img = cate.image;
                let imgString = `${IMG_SRC}/${img}`;
                $(".details-img").prop("src", imgString);
                
            }
        });

        $(".btn-delete").click(function () {
            RECORD_ID = $(this).data("cateId");
            console.log(RECORD_ID)
        });
    }

    $("#delete-confirmation-modal .btn-remove ").click(async function () {
        const PUT_RECORD = HOST + "/api/Gallery/" + RECORD_ID +"/" +true;
        var formData = new FormData();
        formData.append("galleryId", RECORD_ID);
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
        if (field == null || field == "") field = "image";
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


    async function getCate(cateId) {
        try {
            const res = await $.ajax({
                url: HOST + "/api/Gallery/GalleryCategory/" + cateId,
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