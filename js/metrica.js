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
var modos = {
	"organico": {"a": 2.4, "b": 1.05, "c": 2.5, "d": 0.38},
	"intermedio": {"a": 3.0, "b": 1.12, "c": 2.5, "d": 0.35},
	"empotrado": {"a": 3.6, "b": 1.2, "c": 2.5, "d": 0.33}
}

function obtenerConteo(sid)
{
	id_conteo = sid + "_conteo";
	conteo = document.getElementById(id_conteo);
	if (conteo.value == "")
		return 1;
	else
		return parseInt(conteo.value);
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
			// obtenemos qué ha marcado
			valor = obtenerValorHorizontalPF(valorDominio[i]);
			if (valor == null)
				continue;
			// obtenemos el valor de eso que ha marcado
			valor = factorPonderado[valorDominio[i]][valor - 1];
			// obtenemos la cantidad o conteo
			cantidad = obtenerConteo(valorDominio[i]);
			// multiplicamos y no queremos negativos, eh
			valor *= Math.abs(cantidad);
			// mostramos todo
			id_resultado = valorDominio[i] + "_resultado";
			fijarTextoEn(id_resultado, valor.toString());
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
		fijarTextoEn("pf_resultado", sumatoria);

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
		fijarTextoEn("atributo_resultado", productoria);

		// buscamos el modo seleccionado
		modo = null;
		radios = document.getElementsByName("modo");
		for (var i=0; i<radios.length; i++)
		{
			if (radios[i].checked)
			{
				modo = modos[radios[i].value];
				console.log("Modo: " + radios[i].value);
				break;
			}
		}
		// calculamos todo
		if (modo != null)
		{
			// calculo de esfuerzo
			atributo = document.getElementById("atributo_resultado");
			pf = document.getElementById("pf_resultado");
			if (atributo.innerText != "" && pf.innerText != "")
			{
				atributo = parseFloat(atributo.innerText);
				pf = parseInt(pf.innerText);
				// formulas
				esfuerzo = modo["a"]*(Math.pow(pf*53, modo["b"]) / 1000)*atributo; // por ahora, se usa como si fuera java:53
				tiempo = modo["c"]*Math.pow(esfuerzo, modo["d"]);
				personal = esfuerzo/(tiempo ? tiempo != 0 : 1);
				// mostramos los resultados
				fijarTextoEn("mm_resultado", esfuerzo);
				fijarTextoEn("ms_resultado", tiempo);
				fijarTextoEn("ps_resultado",  personal);
			}
		}

	}, 2000);
});