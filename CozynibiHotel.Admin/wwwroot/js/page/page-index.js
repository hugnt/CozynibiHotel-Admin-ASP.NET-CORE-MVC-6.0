import { lucide } from '../icons.js'
import { HOST, GET_IMAGE_URL } from '../env.js'


$(document).ready(async function () {
    var BASE_URL = HOST + "/api/Page";
    var CATEGORY_IMG_SRC = GET_IMAGE_URL + "banner"
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
                        cateList.push(res[i])
                    }
                }
                //cateList = res;
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
            if (cate.isDeleted == true) continue;
            let imgHtml = "";
            console.log(cate)
            for (let j = 0; j < cate.images.length; j++) {
                let img = cate.images[j];
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
            if (cate.isActive) {
                status = `
							<div class="flex items-center justify-center text-success">
								${lucide.checkSquare} Active
							</div>
						`;
            }
            else {
                status = `
							<div class="flex items-center justify-center text-danger">
								${lucide.checkSquare} Inactive
							</div>
						`;
            }

            let statusMenu = "";
            if (cate.isMenuActive) {
                statusMenu = `
							<div class="flex items-center justify-center text-success">
								${lucide.checkSquare} YES
							</div>
						`;
            }
            else {
                statusMenu = `
							<div class="flex items-center justify-center text-danger">
								${lucide.checkSquare} NO
							</div>
						`;
            }

            let html = `
							<tr class="intro-x">
								<td class="w-10">P${cate.id}</td>
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
                                <td class="text-center">${cate.url ? cate.url:""}</td>
								<td class="w-40">
									${statusMenu}
								</td>
								<td class="w-40">
									${status}							
								</td>
								<td class="table-report__action w-56">
									<div class="flex justify-center items-center">
										<a class="flex items-center mr-3 btn-edit" style="cursor:pointer;" data-cate-id="${cate.id}" onclick="window.location.href='/Admin/Page/Edit/${cate.id}';">
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
							</tr>
						`;
            $('.table-report tbody').append(html);

        }

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
                //images
                $(".multiple-items").html("");
                let imgHtml = "";
                for (let i = 0; i < cate.images.length; i++) {
                    let img = cate.images[i];
                    let imgString = `${CATEGORY_IMG_SRC}/${img}`;
                    imgHtml += `
					<div class="h-32 px-2">
						<div class="h-full bg-slate-100 dark:bg-darkmode-400 rounded-md">
							<img src="${imgString}"/>
						</div>
					</div>
				`;
                }
                $(".multiple-items").append(imgHtml);
                if ($(".multiple-items").length) {
                    $(".multiple-items").each(function () {
                        tns({
                            container: this,
                            slideBy: "page",
                            mouseDrag: true,
                            autoplay: false,
                            controls: true,
                            items: 1,
                            nav: false,
                            speed: 500,
                            responsive:
                            {
                                600: {
                                    items: 3,
                                },
                                480: {
                                    items: 2,
                                },
                            },
                        });
                    });
                }
                //informations
                cate.roomRate = (cate.roomRate == null || cate.roomRate == "") ? 0 : cate.roomRate;
                $('#id').val("P" + cate.id);
                $('#name').val(cate.name);
                $('#isMenuActive').val(cate.isMenuActive ? "YES" : "NO");
                $('#status').val(cate.isActive ? "Active" : "Inactive");
                $('#url').val(cate.url);
                $('#description').html(cate.description);
                $('#createdAt').val(cate.createdAt);
                $('#createdBy').val(CREATED_ONE.fullName);
                $('#updatedAt').val(cate.updatedAt);
                $('#updatedBy').val(UPDATED_ONE.fullName);

                $('#modal-details').css("display", "block");
            }
        });

        $(".btn-delete").click(function () {
            RECORD_ID = $(this).data("cateId");
            console.log(RECORD_ID)
        });
    }

    $("#delete-confirmation-modal .btn-remove ").click(async function () {
        const PUT_RECORD = HOST + "/api/Page/" + RECORD_ID +"/" +true;
        var formData = new FormData();
        formData.append("pageId", RECORD_ID);
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
    
    $(".sortby-select").change(function () {
        sortBy($(this).val());
        updatePagination(pagination);
        renderPagination(pagination);
        renderListData(pagination.recordShow);
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
                updatePagination(pagination);
                renderPagination(pagination);
                renderListData(pagination.recordShow);
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


});