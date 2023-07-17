import { HOST, GET_IMAGE_URL } from '../env.js'
import jwt_decode from 'https://cdn.jsdelivr.net/npm/jwt-decode@3.1.2/+esm'


$(document).ready(async function () {
    //GET TOKEN
    var accessToken = $.cookie('AccessToken');

    var decoded = jwt_decode(accessToken);
    const USER_ID = decoded.Id;
    

    //INIT
    var imgList = [];

    var currentUrl = window.location.href;
    const RECORD_ID = currentUrl.split('/').pop();

    const GET_RECORD = HOST + "/api/TourTravel/" + RECORD_ID;
    const PUT_RECORD = HOST + "/api/TourTravel/" + RECORD_ID;

    var newRecord = {
        TourGalleries: [],
        TourSchedules: [],
        TourExclusions: [],
        TourInclusions: [],
        TourPrices: [],
        Name: "",
        Address: 0,
        isActive: false,
        isDeleted: false,
        Equipments: [],
        UpdatedBy: 0,
        CreatedBy: 0
    }


    var editRecord = {};


    //CKEdior && Tom-sellect
    var excluList = [];
    var incluList = [];
    var priceList = [];
    var scheduleList = [];
    var imgList = [];

    var inclusionselect = new TomSelect('#inclusion-select', {
        options: [

        ],
        plugins: {
            dropdown_input: {},
            remove_button: {
                title: 'remove this item',
            }
        },
        persist: false,
        create: true,
    });
    var exclusionselect = new TomSelect('#exclusion-select', {
        options: [

        ],
        plugins: {
            dropdown_input: {},
            remove_button: {
                title: 'remove this item',
            }
        },
        persist: false,
        create: true,
    });


    $(".section-preview").click(function () {
        $(".section-preview").addClass("border-transparent dark:border-transparent");
        $(".section-preview").removeClass("dark:border-primary text-primary font-medium");
        $(this).removeClass("border-transparent dark:border-transparent");
        $(this).addClass("border-primary dark:border-primary text-primary font-medium");
    });

    $(".upload-img").change(function () {
        var file = this.files[0];

        if (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $(".img-show").append(`
                    <div class="img-file col-span-5 md:col-span-2 h-28 relative image-fit cursor-pointer zoom-in">
						<img class="rounded-md" src="${e.target.result}" alt="${file.name}">
						<div title="Remove this image?"
								class="delete-file tooltip w-5 h-5 flex items-center justify-center absolute rounded-full text-white bg-danger right-0 top-0 -mr-2 -mt-2">
							<span>X</span>
						</div>
					</div>
                `);
                imgList.push(file);
                $(".delete-file").click(function () {
                    let imgName = $(this).parent(".img-file").find('img').prop("alt");
                    $(this).parent(".img-file").remove();
                    imgList = imgList.filter(function (file) {
                        return file.name != imgName;
                    })
                    console.log(imgList);
                });
                $(".upload-img").val("");
            }

            reader.readAsDataURL(file);
        }
        else {
            $(".img-show").html(``);
        }
        console.log(imgList);
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

        //images
        var IMAGE_SRC = GET_IMAGE_URL + "tour_travel_2/";
        for (var i = 0; i < record.tourGalleries.length; i++) {
            $(".img-show").append(`
                <div class="img-file col-span-5 md:col-span-2 h-28 relative image-fit cursor-pointer zoom-in">
					<img class="rounded-md" src="${IMAGE_SRC + record.tourGalleries[i]}" alt="${record.tourGalleries[i]}">
					<div title="Remove this image?"
							class="delete-file tooltip w-5 h-5 flex items-center justify-center absolute rounded-full text-white bg-danger right-0 top-0 -mr-2 -mt-2">
						<span>X</span>
					</div>
				</div>
            `);
            $(".delete-file").click(function () {
                let imgName = $(this).parent(".img-file").find('img').prop("alt");
                $(this).parent(".img-file").remove();
                editRecord.tourGalleries = editRecord.tourGalleries.filter(function (file) {
                    return file != imgName;
                });
                console.log(editRecord.tourGalleries);
                
            });
        }

        //name
        $("#record-name").val(record.name);

        //address
        $("#address").val(record.address);

        //Price
        $(".addPrice-item").remove();
        for (var i = 0; i < record.tourPrices.length; i++) {
            var priceItem = record.tourPrices[i];
            $(".addPrice-wrapper").append(`
            <div class="sm:grid grid-cols-3 gap-2 mt-3 addPrice-item">
				<div class="input-form">
					<div class="input-group">
						<input id="" value="${priceItem.minPeople}" type="number" class="form-control minPeople" placeholder="Min people" minlength="1" required>
						<div class="input-group-text">Per</div>
					</div>
				</div>

				<div class="input-form">
					<div class="input-group mt-2 sm:mt-0">
						<input id="" value="${priceItem.maxPeople}" type="number" class="form-control maxPeople" placeholder="Max people" minlength="1" required>
						<div class="input-group-text">Per</div>
					</div>
				</div>

				<div class="input-form">
					<div class="input-group mt-2 sm:mt-0">
						<input id="" value="${priceItem.price}" type="text" class="form-control price" placeholder="Price /1 person" minlength="3" required>
						<div class="input-group-text">$</div>
					</div>
				</div>
			</div>
        `);
        }

        //Schedules
        $(".addSchedule-item").remove();
        for (var i = 0; i < record.tourSchedules.length; i++) {
            var scheduleItem = record.tourSchedules[i];
            $(".addSchedule-wrapper").append(`
            <div class="grid grid-cols-12 gap-2 mt-3 addSchedule-item">
				<input type="time" value="${scheduleItem.startTime}" class="form-control col-span-2 startTime" placeholder="Time" aria-label="Time">
				<input type="text" value="${scheduleItem.content}" class="form-control col-span-10 activityContent" placeholder="Activities" aria-label="Activities">
			</div>
            `);
        }

    }

    //PRICE AND SCHEDULE
    $(".btn-addPrice").click(function () {
        let minPeopleVal = $(".addPrice-wrapper .minPeople").last().val();
        let maxPeopleVal = $(".addPrice-wrapper .maxPeople").last().val();
        let priceVal = $(".addPrice-wrapper .price").last().val();
        if (priceVal == null || priceVal == "" || priceVal == undefined) return;
        $(".addPrice-wrapper").append(`
            <div class="sm:grid grid-cols-3 gap-2 mt-3 addPrice-item">
				<div class="input-form">
					<div class="input-group">
						<input id="" type="number" class="form-control minPeople" placeholder="Min people" minlength="1" required>
						<div class="input-group-text">Per</div>
					</div>
				</div>

				<div class="input-form">
					<div class="input-group mt-2 sm:mt-0">
						<input id="" type="number" class="form-control maxPeople" placeholder="Max people" minlength="1" required>
						<div class="input-group-text">Per</div>
					</div>
				</div>

				<div class="input-form">
					<div class="input-group mt-2 sm:mt-0">
						<input id="" type="text" class="form-control price" placeholder="Price /1 person" minlength="3" required>
						<div class="input-group-text">$</div>
					</div>
				</div>
			</div>
        `);
    });

    $(".btn-addSchedule").click(function () {
        let startTimeVal = $(".addSchedule-wrapper .time").last().val();
        let activityContentVal = $(".addSchedule-wrapper .activityContent").last().val();
        if (activityContentVal == null || activityContentVal == "" || activityContentVal == undefined) return;
        $(".addSchedule-wrapper").append(`
            <div class="grid grid-cols-12 gap-2 mt-3 addSchedule-item">
				<input type="time" class="form-control col-span-2 startTime" placeholder="Time" aria-label="Time">
				<input type="text" class="form-control col-span-10 activityContent" placeholder="Activities" aria-label="Activities">
			</div>
        `);
    });




    //GET LIST EQUIPMENT

    incluList = await getListInclusionOrExclusion("Inclusion");
    excluList = await getListInclusionOrExclusion("Exclusion");
    renderListEquipment(incluList, excluList);

    async function getListInclusionOrExclusion(clusion) {
        try {
            const res = await $.ajax({
                url: HOST + "/api/" + clusion,
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
                $(".loading").css("display", "none");
                $(".main-content").css("display", "block");
                return res;
            }
        } catch (e) {
            console.log(e);
            $(".main-layout").css("display", "none");
            $(".notfound").css("display", "block");
        }
    }

    function renderListEquipment(incluList, excluList) {
        for (var i = 0; i < incluList.length; i++) {
            inclusionselect.addOption({ value: `${incluList[i].name}`, text: `${incluList[i].name}` });
            if (editRecord.tourInclusions.includes(incluList[i].name)) {
                inclusionselect.addItem(incluList[i].name);
            }
        }
        for (var i = 0; i < excluList.length; i++) {
            exclusionselect.addOption({ value: `${excluList[i].name}`, text: `${excluList[i].name}` });
            if (editRecord.tourExclusions.includes(excluList[i].name)) {
                exclusionselect.addItem(excluList[i].name);
            }
        }

    }


    //ADD NEƯ

    $(".btn-update").click(async function () {
        await getUpdatedRecord();
    });


    async function getUpdatedRecord() {
        //images
        for (var i = 0; i < editRecord.tourGalleries.length; i++) {
            newRecord.TourGalleries.push(editRecord.tourGalleries[i]);
        }
        for (var i = 0; i < imgList.length; i++) {
            newRecord.TourGalleries.push(imgList[i].name);
        }

        //name
        var name = $("#record-name").val();
        var address = $("#address").val();

        //price
        $('.addPrice-wrapper .addPrice-item').each(function () {
            const minPeopleVal = $(this).find('.minPeople').val();
            const maxPeopleVal = $(this).find('.maxPeople').val();
            const priceVal = $(this).find('.price').val();

            if (minPeopleVal == null || minPeopleVal < 0 || minPeopleVal == "") minPeopleVal = 0;
            if (priceVal == null || priceVal < 0 || priceVal == "") {
                return;
            }

            const obj = {
                price: priceVal,
                minPeople: minPeopleVal,
                maxPeople: maxPeopleVal
            };

            newRecord.TourPrices.push(obj);
        });
        //schedule
        $('.addSchedule-wrapper .addSchedule-item').each(function () {
            const startTimeVal = $(this).find('.startTime').val();
            const activityContentVal = $(this).find('.activityContent').val();

            if (activityContentVal == null || activityContentVal < 0 || activityContentVal == "") {
                return;
            }

            const obj = {
                startTime: startTimeVal,
                content: activityContentVal
            };


            newRecord.TourSchedules.push(obj);
        });

        //inclu && exclu
        var inclusionSelected = inclusionselect.getValue();
        var exclusionSelected = exclusionselect.getValue();

        newRecord.Name = name;
        newRecord.Address = address;
        newRecord.TourInclusions = inclusionSelected;
        newRecord.TourExclusions = exclusionSelected;

        newRecord.isActive = $('#status-active').prop('checked');
        console.log(editRecord)
        
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
        await putUpdatedRecord(newRecord, imgList);
        return true;


    }

    function getValidation(newRecord) {
        var validatObj = {
            images: newRecord.TourGalleries,
            name: newRecord.Name,
            price: newRecord.TourPrices,
            schedule: newRecord.TourSchedules
        }
        for (let prop in validatObj) {
            if (validatObj[prop] == null || validatObj[prop] == '' || validatObj[prop] == undefined) {
                return {
                    status: false,
                    message: `${prop} required `
                };
            }
        }
        if (validatObj.images.length == 0) {
            return {
                status: false,
                message: "Some images are required "
            };
        }
        if (validatObj.price.length == 0) {
            return {
                status: false,
                message: "Prices are required "
            };
        }
        if (validatObj.schedule.length == 0) {
            return {
                status: false,
                message: "Schedule is required "
            };
        }
        if (validatObj.name.length < 5 || validatObj.name.length >= 255) {
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

    async function putUpdatedRecord(newRecord, imagesUpload) {
        var formData = new FormData();
        formData.append("tourTravelId", RECORD_ID);
        formData.append("Id", RECORD_ID);
        formData.append("Name", newRecord.Name);
        formData.append("Address", newRecord.Address);
        for (var i = 0; i < newRecord.TourInclusions.length; i++) {
            formData.append("TourInclusions", newRecord.TourInclusions[i]);
        }
        for (var i = 0; i < newRecord.TourExclusions.length; i++) {
            formData.append("TourExclusions", newRecord.TourExclusions[i]);
        }
        for (var i = 0; i < newRecord.TourGalleries.length; i++) {
            formData.append("TourGalleries", newRecord.TourGalleries[i]);
        }

        for (var i = 0; i < newRecord.TourPrices.length; i++) {
            formData.append(`TourPrices[${i}][price]`, newRecord.TourPrices[i].price);
            formData.append(`TourPrices[${i}][minPeople]`, newRecord.TourPrices[i].minPeople);
            formData.append(`TourPrices[${i}][maxPeople]`, newRecord.TourPrices[i].maxPeople);
        }
        for (var i = 0; i < newRecord.TourSchedules.length; i++) {
            formData.append(`TourSchedules[${i}][startTime]`, newRecord.TourSchedules[i].startTime);
            formData.append(`TourSchedules[${i}][content]`, newRecord.TourSchedules[i].content);
        }
        formData.append("IsActive", newRecord.isActive);
        formData.append("UpdatedBy", USER_ID);
        formData.append("CreatedBy", newRecord.CreatedBy);
        for (var i = 0; i < imagesUpload.length; i++) {
            formData.append("images", imagesUpload[i]);
        }
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
            window.location.href = '/Admin/TourTravel';
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