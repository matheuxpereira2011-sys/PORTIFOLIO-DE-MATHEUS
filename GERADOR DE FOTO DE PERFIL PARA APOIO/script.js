const galeria = document.querySelector("#galeria");
const camera = document.querySelector("#camera");
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const zoom = document.querySelector("#zoom");
const gerar = document.querySelector("#gerar");
const baixar = document.querySelector("#baixar");
const resetar = document.querySelector("#resetar");
const mensagem = document.querySelector("#mensagem");

const TAMANHO = 1080;
const CENTRO = TAMANHO / 2;
const RAIO = TAMANHO / 2;

canvas.width = TAMANHO;
canvas.height = TAMANHO;

const foto = new Image();
const moldura = new Image();

moldura.src = "./assets/moldura.png";

let molduraCarregada = false;
let fotoCarregada = false;

let fotoX = 0;
let fotoY = 0;
let escalaBase = 1;

let arrastando = false;
let inicioX = 0;
let inicioY = 0;
let deslocamentoInicialX = 0;
let deslocamentoInicialY = 0;

moldura.onload = () => {
    molduraCarregada = true;
    desenhar();
};

moldura.onerror = () => {
    molduraCarregada = false;
    desenhar();
};

function carregarFoto(input) {

    const arquivo = input.files[0];

    if (!arquivo) return;

    const url = URL.createObjectURL(arquivo);

    foto.onload = () => {

        fotoCarregada = true;

        mensagem.style.display = "none";

        escalaBase = Math.min(
            TAMANHO / foto.width,
            TAMANHO / foto.height
        ) * 0.85;

        fotoX = 0;
        fotoY = 0;

        zoom.value = 0.85;

        baixar.style.display = "none";

        desenhar();

        URL.revokeObjectURL(url);
    };

    foto.onerror = () => {

        alert("Não foi possível carregar essa imagem.");

        URL.revokeObjectURL(url);
    };

    foto.src = url;
}

galeria.addEventListener("change", () => {
    carregarFoto(galeria);
});

camera.addEventListener("change", () => {
    carregarFoto(camera);
});

function desenhar() {

    ctx.clearRect(
        0,
        0,
        TAMANHO,
        TAMANHO
    );

    if (!fotoCarregada) return;

    const valorZoom = Number(zoom.value);

    const escalaFinal = escalaBase * valorZoom;

    const largura = foto.width * escalaFinal;
    const altura = foto.height * escalaFinal;

    const x =
        (TAMANHO - largura) / 2 + fotoX;

    const y =
        (TAMANHO - altura) / 2 + fotoY;

    ctx.save();

    ctx.beginPath();

    ctx.arc(
        CENTRO,
        CENTRO,
        RAIO,
        0,
        Math.PI * 2
    );

    ctx.clip();

    ctx.drawImage(
        foto,
        x,
        y,
        largura,
        altura
    );

    ctx.restore();

    if (molduraCarregada) {

        ctx.drawImage(
            moldura,
            0,
            0,
            TAMANHO,
            TAMANHO
        );
    }
}

function obterPosicaoCanvas(evento) {

    const retangulo =
        canvas.getBoundingClientRect();

    const escalaX =
        TAMANHO / retangulo.width;

    const escalaY =
        TAMANHO / retangulo.height;

    return {
        x:
            (evento.clientX - retangulo.left)
            * escalaX,

        y:
            (evento.clientY - retangulo.top)
            * escalaY
    };
}

canvas.addEventListener("pointerdown", (evento) => {

    if (!fotoCarregada) return;

    arrastando = true;

    const posicao =
        obterPosicaoCanvas(evento);

    inicioX = posicao.x;
    inicioY = posicao.y;

    deslocamentoInicialX = fotoX;
    deslocamentoInicialY = fotoY;

    canvas.setPointerCapture(
        evento.pointerId
    );
});

canvas.addEventListener("pointermove", (evento) => {

    if (!arrastando) return;

    const posicao =
        obterPosicaoCanvas(evento);

    const movimentoX =
        posicao.x - inicioX;

    const movimentoY =
        posicao.y - inicioY;

    fotoX =
        deslocamentoInicialX + movimentoX;

    fotoY =
        deslocamentoInicialY + movimentoY;

    desenhar();
});

function pararArraste(evento) {

    arrastando = false;

    if (
        evento &&
        canvas.hasPointerCapture(
            evento.pointerId
        )
    ) {
        canvas.releasePointerCapture(
            evento.pointerId
        );
    }
}

canvas.addEventListener(
    "pointerup",
    pararArraste
);

canvas.addEventListener(
    "pointercancel",
    pararArraste
);

zoom.addEventListener("input", () => {

    if (!fotoCarregada) return;

    desenhar();
});

resetar.addEventListener("click", () => {

    if (!fotoCarregada) return;

    fotoX = 0;
    fotoY = 0;

    zoom.value = 0.85;

    baixar.style.display = "none";

    desenhar();
});

gerar.addEventListener("click", () => {

    if (!fotoCarregada) {

        alert("Escolha ou tire uma foto primeiro.");

        return;
    }

    canvas.toBlob((blob) => {

        if (!blob) {

            alert("Não foi possível gerar a imagem.");

            return;
        }

        const url =
            URL.createObjectURL(blob);

        baixar.href = url;

        baixar.style.display = "block";

        baixar.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }, "image/png");
});