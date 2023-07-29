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

    const GET_RECORD = HOST + "/api/FoodOrder/" + RECORD_ID;
    const PUT_RECORD = HOST + "/api/FoodOrder/" + RECORD_ID;


    var newRecord = {
        FullName: "",
        PhoneNumber: "",
        CheckInCode: "",
        FoodList: [],
        Place: "",
        EatingAt: "",
        Note: "",
        Status: "",
        isActive: false,
        isDeleted: false,
        UpdatedBy: 0,
        CreatedBy:0
    }

    var editRecord = {};
    const FOOD_LIST = await getFoods();


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

    //EDIT FOOD LIST
    $(".btn-addFood").click(function () {
        let foodListVal = $(".addFood-wrapper .foodList").last().val();
        let numberVal = $(".addFood-wrapper .number").last().val();
        let priceVal = $(".addFood-wrapper .price").last().val();
        if (foodListVal == null || numberVal <= 0 || numberVal == null) return;
        var htmlFoodSelect = `<option value="${0}" selected>Choose the food</option>`;

        for (var i = 0; i < FOOD_LIST.length; i++) {
            var flag = 0;
            $('.addFood-wrapper .addFood-item').each(function () {
                const foodListVal = $(this).find('.foodList').val();
                if (foodListVal == FOOD_LIST[i].id) flag = 1;
            });
            if (flag == 0) htmlFoodSelect += ` <option value="${FOOD_LIST[i].id}">${FOOD_LIST[i].name}</option>`;
        }
        $(".addFood-wrapper").append(`
            <div class="sm:grid grid-cols-3 gap-2 mt-3 addFood-item">
				<div class="input-form">
					<div class="input-group">
						<select class="foodList-select w-full form-select box foodList" id="" style="border-color:rgb(226, 232, 240)">
							${htmlFoodSelect}
						</select>
					</div>
				</div>

				<div class="input-form">
					<div class="input-group mt-2 sm:mt-0">
						<input id="" type="number" class="form-control number" placeholder="Number" minlength="1" required>
						<div class="input-group-text">Portion</div>
					</div>
				</div>

				<div class="input-form">
					<div class="input-group mt-2 sm:mt-0">
						<input id="" type="text" class="form-control price" placeholder="Price" disabled>
						<div class="input-group-text">$</div>
					</div>
				</div>
			</div>
        `);
        $(".foodList-select").change(function () {
            var id = $(this).val();
            var foodItem = FOOD_LIST.find(x => x.id == id);
            console.log("foodItem: ", foodItem);
            $(this).closest(".addFood-item").find(".number").val(1);
            $(this).closest(".addFood-item").find(".price").val(foodItem.price);
            $("#totalPrice").val(getTotal());
        });
        $(".number").change(function () {
            var number = $(this).val();
            var id = $(this).closest(".addFood-item").find(".foodList").val();
            var curPriceFood = FOOD_LIST.find(x => x.id == id).price;
            $(this).closest(".addFood-item").find(".price").val(number * curPriceFood);
            $("#totalPrice").val(getTotal());
        });
    });

    $(".foodList-select").change(function () {
        var id = $(this).val();
        var foodItem = FOOD_LIST.find(x => x.id == id);
        console.log("foodItem: ", foodItem);
        $(this).closest(".addFood-item").find(".number").val(1);
        $(this).closest(".addFood-item").find(".price").val(foodItem.price);
        $("#totalPrice").val(getTotal());
    });
    $(".number").change(function () {
        var number = $(this).val();
        var id = $(this).closest(".addFood-item").find(".foodList").val();
        var curPriceFood = FOOD_LIST.find(x => x.id == id).price;
        $(this).closest(".addFood-item").find(".price").val(number * curPriceFood);
        $("#totalPrice").val(getTotal());
    });

    function getTotal() {
        var total = 0;
        $('.addFood-wrapper .addFood-item').each(function () {
            const subPrice = $(this).find('.price').val();
            if (isNaN(parseFloat(subPrice))) return;
            //console.log(parseFloat(subPrice))
            total += parseFloat(subPrice);
        });
        return total;
    };

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
                await renderRecord(res);
                
            }
        } catch (e) {
            console.log(e);
            $(".main-layout").css("display", "none");
            $(".notfound").css("display", "block");
        }

    }

    async function renderRecord(record) {
        //status 
        if (record.isActive == true) {
            $('#status-active').prop('checked', true);
        }
        else {
            $('#status-active').prop('checked', false);
        }

        //name
        $("#record-name").val(record.fullName);

        $("#phoneNumber").val(record.phoneNumber);
        $("#checkInCode").val(record.checkInCode);
        $("#place").val(record.place);
        $("#eatingAt").val(record.eatingAt);

        //Food list
        var htmlFoodList = ``;

        for (var i = 0; i < record.foodList.length; i++) {
            var foodItem = await getFood(record.foodList[i].foodId);
            var number = record.foodList[i].number;
            var htmlFoodSelect = ``;
            for (var j = 0; j < FOOD_LIST.length; j++) {
                if (FOOD_LIST[i].foodId == foodItem.id) {
                    htmlFoodSelect += `<option value="${foodItem.id}" selected>${foodItem.name}</option>`
                }
                else {
                    htmlFoodSelect += `<option value="${FOOD_LIST[i].id}">${FOOD_LIST[i].name}</option>`
                }
            }
                
            htmlFoodList += `
                 <div class="sm:grid grid-cols-3 gap-2 mt-3 addFood-item">
				    <div class="input-form">
					    <div class="input-group">
						    <select class="foodList-select w-full form-select box foodList" id="" style="border-color:rgb(226, 232, 240)">
							    ${htmlFoodSelect}
						    </select>
					    </div>
				    </div>

				    <div class="input-form">
					    <div class="input-group mt-2 sm:mt-0">
						    <input id="" type="number" class="form-control number" value="${number}" placeholder="Number" minlength="1" required>
						    <div class="input-group-text">Portion</div>
					    </div>
				    </div>

				    <div class="input-form">
					    <div class="input-group mt-2 sm:mt-0">
						    <input id="" type="text" value="${number * foodItem.price}" class="form-control price" placeholder="Price" disabled>
						    <div class="input-group-text">$</div>
					    </div>
				    </div>
			    </div>
            `;
        }

        $(".addFood-wrapper").append(htmlFoodList);
        $("#totalPrice").val(getTotal());
        $(".foodList-select").change(function () {
            var id = $(this).val();
            var foodItem = FOOD_LIST.find(x => x.id == id);
            console.log("foodItem: ", foodItem);
            $(this).closest(".addFood-item").find(".number").val(1);
            $(this).closest(".addFood-item").find(".price").val(foodItem.price);
            $("#totalPrice").val(getTotal());
        });
        $(".number").change(function () {
            var number = $(this).val();
            var id = $(this).closest(".addFood-item").find(".foodList").val();
            var curPriceFood = FOOD_LIST.find(x => x.id == id).price;
            $(this).closest(".addFood-item").find(".price").val(number * curPriceFood);
            $("#totalPrice").val(getTotal());
        });

        //comment
        if (record.note) {
            editor.setData(record.note);
        }
   

    }



    //ADD NEW
 
    $(".btn-update").click(async function () {
        await getUpdatedRecord();
    });


    async function getUpdatedRecord() {
        var name = $("#record-name").val();
        var phoneNumber = $("#phoneNumber").val();
        var place = $("#place").val();
        var eatingAt = $("#eatingAt").val();
        var checkInCode = $("#checkInCode").val();

        //description
        var note = editor.getData();

        //Map
        newRecord.FullName = name;
        newRecord.PhoneNumber = phoneNumber;
        newRecord.Place = place;
        newRecord.EatingAt = eatingAt;
        newRecord.Note = note;
        newRecord.CheckInCode = checkInCode;
        newRecord.IsActive = $('#status-active').prop('checked');
        newRecord.CreatedBy = editRecord.createdBy;
        if (newRecord.CreatedBy == null) newRecord.CreatedBy = 0;

        $('.addFood-wrapper .addFood-item').each(function () {
            const foodListVal = $(this).find('.foodList').val();
            const numberVal = $(this).find('.number').val();
            const priceVal = $(this).find('.price').val();

            if (foodListVal == null || numberVal < 0 || numberVal == "") numberVal = 0;
            if (priceVal == null || priceVal < 0 || priceVal == "") {
                return;
            }

            const obj = {
                foodId: foodListVal,
                number: numberVal
            };

            newRecord.FoodList.push(obj);
        });

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
            foodList: newRecord.FoodList
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
        if (validatObj.foodList.length == 0) {
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
        formData.append("foodOrderId", RECORD_ID);
        formData.append("Id", RECORD_ID);
        formData.append("FullName", newRecord.FullName);
        formData.append("CheckInCode", newRecord.CheckInCode);
        formData.append("EatingAt", newRecord.EatingAt);
        formData.append("Note", newRecord.Note);
        formData.append("PhoneNumber", newRecord.PhoneNumber);
        formData.append("Place", newRecord.Place);
        for (var i = 0; i < newRecord.FoodList.length; i++) {
            formData.append(`FoodList[${i}][foodId]`, newRecord.FoodList[i].foodId);
            formData.append(`FoodList[${i}][number]`, newRecord.FoodList[i].number);
        }
        formData.append("IsActive", newRecord.isActive);
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
                window.location.href = '/Admin/Menu/FoodOrder';
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

    //GET LIST FOOD

    async function getFoods() {
        try {
            const res = await $.ajax({
                url: HOST + "/api/Food",
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