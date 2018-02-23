/**
* Este script define el comportamiento dinámico de metrica/index.html
* o donde sea que lo enlaces.
*/

var valorDominio = ["ee", "se", "ce", "ali", "aie"];
var factorPonderado = {
	"ee": [3, 4, 6],
	"se": [4, 5, 7],
	"ce": [3, 4, 6],
	"ali": [7, 10, 15],
	"aie": [5, 7, 10]
}

var abreviaturaAtributo = ["fbd", "tbd", "cpj", "rte", "rmv", "vmv", "trp", "qit", "xpa", "ctp", "xpv", "xpl", "tap", "uhs", "rtd"];
var modosPijo = {
	"organico": {"a": 2.4, "b": 1.05, "c": 2.5, "d": 0.38},
	"intermedio": {"a": 3.0, "b": 1.12, "c": 2.5, "d": 0.35},
	"empotrado": {"a": 3.6, "b": 1.2, "c": 2.5, "d": 0.33}
}
var modosPro = {
	"organico": {"a": 3.2, "b": 1.05, "c": 2.5, "d": 0.38},
	"intermedio": {"a": 3.0, "b": 1.12, "c": 2.5, "d": 0.35},
	"empotrado": {"a": 2.8, "b": 1.2, "c": 2.5, "d": 0.33}
}

function obtenerValorHorizontalPF(sid, entero=true)
{
	// obtenemos el id, bueno, lo generamos
	id_valor = sid + "_valor";
	// obtenemos los objetos
	radios = document.getElementsByName(id_valor);
	// buscamos el valor del radio seleccionado
	valor = null;
	for (var i=0; i<radios.length; i++)
	{
		if (radios[i].checked)
		{
			if (entero)
				valor = parseInt(radios[i].value);
			else
				valor = parseFloat(radios[i].value);
			break;
		}
	}
	return valor;
}

function fijarTextoEn(id, texto)
{
	cosa = document.getElementById(id);
	cosa.innerText = texto;
}

window.addEventListener("load", function()
{
	setInterval(function()
	{
		// fijamos valores verticales
		for (var i=0; i<valorDominio.length; i++)
		{
			valorLineal = 0;
			id_valor = valorDominio[i] + "_valor";
			id_resultado = valorDominio[i] + "_resultado";
			lineaFactores = factorPonderado[valorDominio[i]];
			// obtenemos valores en la línea de <input>'s
			valores = document.getElementsByName(id_valor);
			for (var j=0; j<valores.length; j++)
			{
				// obtenemos el valor de un <input>
				valor = valores[j].value;
				if (valor != "")
					valor = parseInt(valor);
				else
					valor = 0;
				valorLineal += lineaFactores[j]*Math.abs(valor);
			}
			// mostramos los valores o ignoramos
			if (valorLineal == 0)
				continue;
			fijarTextoEn(id_resultado, valorLineal.toString());
		}

		// hacemos la sumatoria PF
		sumatoria = 0;
		for (var i=0; i<valorDominio.length; i++)
		{
			id = valorDominio[i] + "_resultado";
			resultado = document.getElementById(id);
			if (resultado.innerText != "")
				valor = parseInt(resultado.innerText);
			else
				valor = 0;
			sumatoria += valor;
		}
		// punto de función
		pf = sumatoria
		console.log("PF = " + pf);
		fijarTextoEn("pf_resultado", pf);
		if (pf != 0)
			fijarTextoEn("pf_final", pf);

		// calculamos PFA
		sumatoria = 0;
		ranges = document.getElementsByName("rating");
		for (var i = 0; i < ranges.length; i++) {
			valor = ranges[i].value;
			valor = parseInt(valor);
			sumatoria += valor;
		}
		fijarTextoEn("rating_resultado", sumatoria);
		// factor de ajuste de complejidad
		fac = 0.65 + 0.01*sumatoria;
		console.log("FAC = " + fac);
		// punto de función ajustado
		pfa = pf * fac;
		console.log("PFA = " + pfa);
		fijarTextoEn("pfa_final", pfa);

		// calculamos cada atributo
		for (var i=0; i<abreviaturaAtributo.length; i++)
		{
			sid = abreviaturaAtributo[i];
			id_resultado = sid + "_resultado";
			valor = obtenerValorHorizontalPF(sid, false);
			if (valor == null)
				continue;
			fijarTextoEn(id_resultado, valor);
		}

		// hacemos la productoria de atributos
		productoria = 1.0;
		for (var i=0; i<abreviaturaAtributo.length; i++)
		{
			id = abreviaturaAtributo[i] + "_resultado";
			resultado = document.getElementById(id);
			if (resultado.innerText != "")
				valor = parseFloat(resultado.innerText);
			else
				valor = 1;
			productoria *= valor;
		}
		console.log("productoria = " + productoria);
		fijarTextoEn("atributo_resultado", productoria);

		// buscamos el modo seleccionado
		modo = null;
		radios = document.getElementsByName("modo");
		for (var i=0; i<radios.length; i++)
		{
			if (radios[i].checked)
			{
				// si es básico, usa una tabla de modos,
				// pero si es intermedio hacia arriba,
				// usará otra tabla
				if (i < 1)
					modo = modosPijo[radios[i].value];
				else
					modo = modosPro[radios[i].value];
				console.log("Modo: " + radios[i].value);
				break;
			}
		}
		// calculamos todo
		if (modo != null)
		{
			// calculo de esfuerzo
			atributo = document.getElementById("atributo_resultado");
			pfa = document.getElementById("pfa_final");
			if (atributo.innerText != "" && pf.innerText != "")
			{
				atributo = parseFloat(atributo.innerText);
				pfa = parseInt(pfa.innerText);
				// fórmulas súperpoderosas
				sloc = pfa*53;
				console.log("SLOC = " + sloc);
				esfuerzo = modo["a"]*(Math.pow(sloc/1000, modo["b"]))*atributo; // por ahora, se usa como si fuera java:53
				tiempo = modo["c"]*Math.pow(esfuerzo, modo["d"]);
				personal = esfuerzo/(tiempo ? tiempo != 0 : 1);
				// mostramos los resultados
				fijarTextoEn("mm_resultado", esfuerzo);
				fijarTextoEn("ms_resultado", tiempo);
				fijarTextoEn("ps_resultado",  personal);
				// falta estimar costo del proyecto
			}
		}
		console.log("==========================================");
	}, 2000);
});