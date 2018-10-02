/* Set the width of the side navigation to 250px and the left margin of the page content to 250px */
function toggleNav() {
	/*if statement needs to be in this order or else it doesn't recognize left style first click*/
	if(document.getElementById("mySidenav").style.left == "0px") {
		closeMenu();
    	/*rotate menu button*/
    	document.getElementById("menu-toggle").style.transform = "rotate(90deg)";
    	document.getElementById("menu-toggle").style.top = "30px";
    	document.getElementById("menu-toggle").style.right = "-20px";	
	}
	else {
		closeContact();
		closeLogin();				

		document.getElementById("mySidenav").style.left = "0px";
    	document.getElementById("wrapper").style.marginLeft = "350px";
    	/*rotate menu button*/
    	document.getElementById("menu-toggle").style.transform = "rotate(0deg)";
    	document.getElementById("menu-toggle").style.top = "15px";
    	document.getElementById("menu-toggle").style.right = "15px";	
	}


} 
/* Toggle contact bar */
function toggleContact() {
	if(document.getElementById("myContactBar").style.right == "0px") {
		document.getElementById("myContactBar").style.right = "-300px";
    	document.getElementById("wrapper").style.marginRight = "0px";
	}
	else { //open contact bar
		document.getElementById("myContactBar").style.right = "0px";
    	document.getElementById("wrapper").style.marginRight = "300px";

    	closeMenu();
    	closeLogin();

    	/*rotate menu button*/
    	document.getElementById("menu-toggle").style.transform = "rotate(90deg)";
    	document.getElementById("menu-toggle").style.top = "30px";
    	document.getElementById("menu-toggle").style.right = "-20px";
	}
}

function toggleLoginDropdown() {
	if(document.getElementById("myLoginBar").style.top == "0px") {
		closeLogin();
	}
	else { //open login bar
		document.getElementById("myLoginBar").style.top = "0px";

    	closeMenu();
    	closeContact();
	}
}

function closeMenu() {
	document.getElementById("mySidenav").style.left = "-300px";
    document.getElementById("wrapper").style.marginLeft = "50px";

    /*rotate menu button*/
	document.getElementById("menu-toggle").style.transform = "rotate(90deg)";
	document.getElementById("menu-toggle").style.top = "30px";
	document.getElementById("menu-toggle").style.right = "-20px";	
}

function closeContact() {
	/*ensure contact bar is closed */
	document.getElementById("myContactBar").style.right = "-300px";
	document.getElementById("wrapper").style.marginRight = "0px";
}

function closeLogin(){
	document.getElementById("myLoginBar").style.top = "-300px";
}

var acc = document.getElementsByClassName("accordion");
for (var i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
        /* Toggle between adding and removing the "active" class,
        to highlight the button that controls the panel */
        this.classList.toggle("active");

        /* Toggle between hiding and showing the active panel */
        var panel = this.nextElementSibling;
        if (panel.style.display === "block") {
            panel.style.display = "none";
        } else {
            panel.style.display = "block";
        }
    });
} 