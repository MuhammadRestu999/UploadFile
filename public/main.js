function getSize(number) {
  let SI_POSTFIXES = ["", " K", " M", " G", " T", " P", " E"];
  let tier = Math.log10(Math.abs(number)) / 3 | 0;
  if(tier == 0) return number + " B";

  let postfix = SI_POSTFIXES[tier] + "B";
  let scale = Math.pow(10, tier * 3);
  let scaled = number / scale;
  let formatted = scaled.toFixed(1) + "";
  if(/\.0$/.test(formatted)) formatted = formatted.substr(0, formatted.length - 2);

  return formatted + postfix;
};
function formatDate(d) {
  const p = n => (""+n).padStart(2, "0");

  d = new Date(d);
  const YYYY = d.getFullYear();
  const MM = d.getMonth() + 1;
  const DD = d.getDate();
  const hh = d.getHours();
  const mm = d.getMinutes();
  const ss = d.getSeconds();

  return [YYYY, MM, DD].map(p).join("-") + ", " + [hh,mm, ss].map(p).join(":");
};
function getList() {
  $.get("/list.json", (r) => {
    if(!r.length) return list.innerHTML = "None";

    let str = "";
    for(let i of r) str += `
        <a href="/u/${i.name}">${i.name}</a>
        <br><br>
        <span>File Size : ${getSize(i.size)}</span>
        <br>
        <span>Uploaded on ${formatDate(i.date)}</span>
        <br><br>
        <a href="/u/${i.name}" style="background-color: dodgerblue; border: 2px solid black; border-radius: 4px; padding: 4px;" download="${i.name}">Download</a>
        <hr>`
    list.innerHTML = str;
  });
};

$(document.body).ready(() => {
  getList();
  $("form").on("submit", () => {
    Swal.fire({
      title: "Uploading...",
      text: "Please wait",
      imageUrl: "/assets/loading.gif",
      showConfirmButton: false,
      allowOutsideClick: false
    });
    const fd = new FormData();
    for(let file of sub1.files) fd.append("files[]", file);
    $.ajax({
      url: "/upload",
      type: "post",
      data: fd,
      cache: false,
      contentType: false,
      processData: false,
      success: function(d) {
        if(!d.message) return;

        let str = `${d.message}<br><br>Success :`;
        for(let [ori, changed] of d.uploaded) str += `<br>${ori} => ${changed}`;

        Swal.fire("Success", str, "success").then(getList);
      }
    });
  });
});
