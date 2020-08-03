TARGET_CLASSES = {
	0: "10_g1",
	1: "10_g2",
	2: "100_g1",
	3: "100_g2",
	4: "2_g1",
	5: "2_g2",
	6: "20_g1",
	7: "20_g2",
	8: "5_g1",
	9: "5_g2",
   10: "50_g1",
   11: "50_g2"
};

IMAGENS = ["nota2","nota5","nota10","nota20","nota50","nota100"];

let model;

async function load_model() {
    console.log( "Loading model..." );
    model = await tf.loadGraphModel('model/model.json');
    console.log( "Model loaded." );	
}

async function predict(model, image) {
	
	let tensor = tf.browser.fromPixels(image, 3)
		.resizeNearestNeighbor([224, 224]) // change the image size
		.expandDims()
		.toFloat()
		.reverse(-1); // RGB -> BGR
		
	let predictions = await model.predict(tensor).data();
	
	console.log(predictions);
	
	let top5 = Array.from(predictions)
		.map(function (p, i) { // this is Array.map
			return {
				probability: p,
				className: TARGET_CLASSES[i] // we are selecting the value from the obj
			};
		}).sort(function (a, b) {
			return b.probability - a.probability;
		}).slice(0, 2);	
		
	return top5;
}

async function predict_imagemfixa(model, imageID) {
	let image = $('#' + imageID).get(0);
	let list = $("#" + imageID + "_pred");
	
	let top5 = await predict(model, image);

	list.empty();
	top5.forEach(function (p) {
		list.append(`Predição: <li>${p.className}: ${p.probability.toFixed(6)}</li>`);
	});	
}

async function predict_camera(model, image) {
	let list = $("#prediction-list");
	
	let top5 = await predict(model, image);

	list.empty();
	top5.forEach(function (p) {
		if (p.probability > 0.3)
			list.append(`Predição: <li>${p.className}: ${p.probability.toFixed(6)}</li>`);
	});	
}

$("#image-selector").change(function () {
	let reader = new FileReader();
	reader.onload = function () {
		let dataURL = reader.result;
		$("#selected-image").attr("src", dataURL);
		$("#prediction-list").empty();
	}
	
	let file = $("#image-selector").prop('files')[0];
	reader.readAsDataURL(file);
});

$("#predict-button").click(async function () {
	for (i in imagens)
		predict_imagemfixa(model, imagens[i]);
});
