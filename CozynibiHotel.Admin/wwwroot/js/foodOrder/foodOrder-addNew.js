import { HOST } from '../env.js'
import jwt_decode from 'https://cdn.jsdelivr.net/npm/jwt-decode@3.1.2/+esm'


$(document).ready(async function () {
    //INIT
    $(".loading").css("display", "none");
    $(".main-content").css("display", "block");
    //GET TOKEN
    var accessToken = $.cookie('AccessToken');
    var decoded = jwt_decode(accessToken);
    const USER_ID = decoded.Id;
    var cateList = [];

    var imgList = [];
    var POST_RECORD = HOST + "/api/FoodOrder";
    var newRecord = {
        fullName: "",
        phoneNumber: "",
        checkInCode:"",
        foodList: [],
        place: "",
        eatingAt:"",
        note: "",
        status: "",
        createdBy:0,
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

    const FOOD_LIST = await getFoods();


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
    //ADD NEW

    $(".btn-addnew").click(async function () {
        await getNewRecord();
    });

    async function getNewRecord() {
    
        //name
        var name = $("#record-name").val();
        var phoneNumber = $("#phoneNumber").val();
        var place = $("#place").val();
        var eatingAt = $("#eatingAt").val();
        var checkInCode = $("#checkInCode").val();
        
        //description
        var note = editor.getData();

        //Map
        newRecord.fullName = name;
        newRecord.phoneNumber = phoneNumber;
        newRecord.place = place;
        newRecord.eatingAt = eatingAt;
        newRecord.note = note;
        newRecord.createdBy = USER_ID;
        newRecord.checkInCode = checkInCode;

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

            newRecord.foodList.push(obj);
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
        await postNewRecord(newRecord);
        return true;


    }

    function getValidation(newRecord) {
        var validatObj = {
            name: newRecord.fullName,
            foodList: newRecord.foodList
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

    async function postNewRecord(newRecord) {
        var formData = new FormData();
        formData.append("FullName", newRecord.fullName);
        formData.append("CheckInCode", newRecord.checkInCode);
        formData.append("EatingAt", newRecord.eatingAt);
        formData.append("Note", newRecord.note);
        formData.append("PhoneNumber", newRecord.phoneNumber);
        formData.append("Place", newRecord.place);
        for (var i = 0; i < newRecord.foodList.length; i++) {
            formData.append(`FoodList[${i}][foodId]`, newRecord.foodList[i].foodId);
            formData.append(`FoodList[${i}][number]`, newRecord.foodList[i].number);
        }
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
                    window.location.href = '/Admin/FoodOrderAndBooing/FoodOrder';
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
                renderListFood(res);
                return res;

            }
        } catch (e) {
            console.log(e);
            $(".main-layout").css("display", "none");
            $(".notfound").css("display", "block");
        }
    }

    function renderListFood(foodList) {
        var cateHtml = `<option value="${0}" selected>Choose the food</option>`;
        for (var i = 0; i < foodList.length; i++) {
            cateHtml += `
                <option value="${foodList[i].id}">${foodList[i].name}</option>
            `;
        }
        $(".foodList-select").append(cateHtml);

    }


});