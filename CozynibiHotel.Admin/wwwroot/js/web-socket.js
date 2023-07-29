import { HUB, HOST, GET_IMAGE_URL } from './env.js'

$(document).ready(function () {
	var connection = new signalR.HubConnectionBuilder()
		.withUrl(HUB)
		.configureLogging(signalR.LogLevel.Information)
		.build();

    //Contact
	connection.on("SendNotificationToUser", function (contact) {
        console.log("Recieved FROM HUB: ", contact);
        let now = new Date();
        let hours = now.getHours().toString().padStart(2, '0');
        let minutes = now.getMinutes().toString().padStart(2, '0');
        let currentTime = hours + ':' + minutes;

        let imageContact = GET_IMAGE_URL + "user/user4.png";

        const htmlNotification = `
			<div class="cursor-pointer relative flex items-center mt-5 notice-item notice-item-contact notice-Contact">
                <div class="w-12 h-12 flex-none image-fit mr-1">
                    <img alt="" class="rounded-full"
                        src="${imageContact}">
                    <div
                        class="w-3 h-3 bg-success absolute right-0 bottom-0 rounded-full border-2 border-white">
                    </div>
                </div>
                <div class="ml-2 overflow-hidden">
                    <div class="flex items-center">
                        <a href="javascript:;" class="font-medium truncate mr-5">New Contact</a>
                        <div class="text-xs text-slate-400 ml-auto whitespace-nowrap">${currentTime}</div>
                    </div>
                    <div class="w-full truncate text-slate-500 mt-0.5">
                        Custommer: ${contact.fullName}, ${contact.phoneNumber}, ${contact.email}
                    </div>
                </div>
            </div>
		`;
        $(".notification-content__title").after(htmlNotification);
        $(".notification").addClass("notification--bullet");
        $(".notice-Contact").click(function () {
            window.location.href = "/Admin/ContactAndBooking/Contact";
        });
    });

    //Booking
    connection.on("SendNotificationBooking", function (booking) {
        console.log("Recieved FROM HUB: ", booking);
        let now = new Date();
        let hours = now.getHours().toString().padStart(2, '0');
        let minutes = now.getMinutes().toString().padStart(2, '0');
        let currentTime = hours + ':' + minutes;

        let imageContact = GET_IMAGE_URL + "bell.png";

        const htmlNotification = `
			<div class="cursor-pointer relative flex items-center mt-5 notice-item notice-item-booking notice-Booking">
                <div class="w-12 h-12 flex-none image-fit mr-1">
                    <img alt="" class="rounded-full"
                        src="${imageContact}">
                    <div
                        class="w-3 h-3 bg-success absolute right-0 bottom-0 rounded-full border-2 border-white">
                    </div>
                </div>
                <div class="ml-2 overflow-hidden">
                    <div class="flex items-center">
                        <a href="javascript:;" class="font-medium truncate mr-5">New Booking</a>
                        <div class="text-xs text-slate-400 ml-auto whitespace-nowrap">${currentTime}</div>
                    </div>
                    <div class="w-full truncate text-slate-500 mt-0.5">
                        Custommer: ${booking.fullName}, ${booking.phoneNumber}, ${booking.email}
                    </div>
                </div>
            </div>
		`;
        $(".notification-content__title").after(htmlNotification);
        $(".notification").addClass("notification--bullet");
        $(".notice-Booking").click(function () {
            window.location.href = "/Admin/ContactAndBooking/Booking";
        });
    });

    //Food Order
    connection.on("SendNotificationFoodOrder", function (foodOrder) {
        console.log("Recieved FROM HUB: ", foodOrder);
        let now = new Date();
        let hours = now.getHours().toString().padStart(2, '0');
        let minutes = now.getMinutes().toString().padStart(2, '0');
        let currentTime = hours + ':' + minutes;

        let imageContact = GET_IMAGE_URL + "foodOrder.png";

        const htmlNotification = `
			<div class="cursor-pointer relative flex items-center mt-5 notice-item notice-item-foodOrder notice-Booking">
                <div class="w-12 h-12 flex-none image-fit mr-1">
                    <img alt="" class="rounded-full"
                        src="${imageContact}">
                    <div
                        class="w-3 h-3 bg-success absolute right-0 bottom-0 rounded-full border-2 border-white">
                    </div>
                </div>
                <div class="ml-2 overflow-hidden">
                    <div class="flex items-center">
                        <a href="javascript:;" class="font-medium truncate mr-5">New Booking</a>
                        <div class="text-xs text-slate-400 ml-auto whitespace-nowrap">${currentTime}</div>
                    </div>
                    <div class="w-full truncate text-slate-500 mt-0.5">
                        Custommer: ${foodOrder.fullName}, ${foodOrder.phoneNumber}, ${foodOrder.eatingAt}
                    </div>
                </div>
            </div>
		`;
        $(".notification-content__title").after(htmlNotification);
        $(".notification").addClass("notification--bullet");
        $(".notice-Booking").click(function () {
            window.location.href = "/Admin/Menu/FoodOrder";
        });
    });

	connection.start().then(function () {

	}).catch(function (err) {
		return console.error(err.toString());
	});
});