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
function del(name) {
  $.ajax({
    url: "/delete",
    type: "post",
    data: {
      name
    },
    success: function(d) {
      let str = d.message;
      Swal.fire("Success", str, "success").then(getList);
    }
  });
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
        <a href="javascript:void(0);" onclick="del('${i.name}')" style="background-color: dodgerblue; border: 2px solid black; border-radius: 4px; padding: 4px;">Delete</a>
        <hr>`
    list.innerHTML = str;
  });
};

$(document.body).ready(getList);
