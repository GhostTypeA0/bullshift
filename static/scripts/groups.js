//MAKE THE GROUP BOX POPUP VISIBLE VS INVISIBLE
//--------------------------------------------------------------------------------------
const groupsBtn = document.getElementById("groupsBtn");
const groupBox = document.querySelector(".groupBox");


groupsBtn.addEventListener("click", () => {

  const isHidden = groupBox.classList.contains("hidden");

  if (isHidden) {

    groupBox.classList.remove("hidden");

    const measure = groupsBtn.getBoundingClientRect();

    groupBox.style.top = (measure.bottom - groupBox.offsetHeight) + "px";
    groupBox.style.left = (measure.right + 10) + "px";

    groupBox.classList.add("visible");

    loadPendingGroup();

  } else {
    groupBox.classList.remove("visible");
    groupBox.classList.add("hidden");
  }
});
