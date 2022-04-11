import { createRequire } from "https://deno.land/std@0.126.0/node/module.ts";
const require = createRequire(import.meta.url);

const fonts = {
    Roboto: {
        normal: 'fonts/Roboto-Regular.ttf',
        bold: 'fonts/Roboto-Medium.ttf',
        italics: 'fonts/Roboto-Italic.ttf',
        bolditalics: 'fonts/Roboto-MediumItalic.ttf'
    }
};

const PdfPrinter = require('pdfmake');
const printer = new PdfPrinter(fonts);
const Stream = require('stream');

export default async function (bills: { [key: string]: unknown }[]) {
    const bufs: Uint8Array[] = [];
    const pdfStream = new Stream.Writable({
        write: (chunk: Uint8Array, _encoding: string, callback: () => void) => {
            bufs.push(chunk);
            callback();
        }
    })

    const docDefinition = {
        pageOrientation: 'landscape',
        content: bills.map((bill, i) => {
            const billDef = [
                {
                    svg: `
                    <svg width="210" height="78" viewBox="0 0 210 78" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path id="ripple" fill-rule="evenodd" clip-rule="evenodd" d="M37.4529 13.648C35.2928 13.648 33.5168 13.024 32.1249 11.776C30.7809 10.48 30.1089 8.896 30.1089 7.02402C30.1089 5.104 30.7809 3.52002 32.1249 2.272C33.5168 0.976013 35.2928 0.328003 37.4529 0.328003C39.5649 0.328003 41.2928 0.976013 42.6368 2.272C44.0289 3.52002 44.7249 5.104 44.7249 7.02402C44.7249 8.896 44.0289 10.48 42.6368 11.776C41.2928 13.024 39.5649 13.648 37.4529 13.648ZM43.5729 17.824V58H31.2609V17.824H43.5729ZM12.776 24.52C14.216 22.312 16.016 20.584 18.176 19.336C20.336 18.04 22.736 17.392 25.376 17.392V30.424H21.992C18.92 30.424 16.616 31.096 15.08 32.44C13.544 33.736 12.776 36.04 12.776 39.352V58H0.463989V17.824H12.776V24.52ZM69.7753 18.976C67.6632 20.128 66.0073 21.64 64.8073 23.512V17.824H52.4952V77.152H64.8073V52.384C66.0073 54.208 67.6632 55.696 69.7753 56.848C71.9352 58 74.4072 58.576 77.1912 58.576C80.5032 58.576 83.5032 57.736 86.1912 56.056C88.8793 54.328 90.9912 51.904 92.5272 48.784C94.1113 45.616 94.9033 41.968 94.9033 37.84C94.9033 33.712 94.1113 30.088 92.5272 26.968C90.9912 23.848 88.8793 21.448 86.1912 19.768C83.5032 18.088 80.5032 17.248 77.1912 17.248C74.3593 17.248 71.8872 17.824 69.7753 18.976ZM79.7833 30.64C81.5112 32.368 82.3752 34.768 82.3752 37.84C82.3752 40.912 81.5112 43.36 79.7833 45.184C78.0552 46.96 75.9672 47.848 73.5192 47.848C71.0712 47.848 68.9832 46.96 67.2552 45.184C65.5753 43.408 64.7352 40.984 64.7352 37.912C64.7352 34.84 65.5753 32.416 67.2552 30.64C68.9832 28.864 71.0712 27.976 73.5192 27.976C76.0153 27.976 78.1033 28.864 79.7833 30.64ZM113.674 23.512C114.874 21.64 116.53 20.128 118.642 18.976C120.754 17.824 123.226 17.248 126.058 17.248C129.37 17.248 132.37 18.088 135.058 19.768C137.746 21.448 139.858 23.848 141.394 26.968C142.978 30.088 143.77 33.712 143.77 37.84C143.77 41.968 142.978 45.616 141.394 48.784C139.858 51.904 137.746 54.328 135.058 56.056C132.37 57.736 129.37 58.576 126.058 58.576C123.274 58.576 120.802 58 118.642 56.848C116.53 55.696 114.874 54.208 113.674 52.384V77.152H101.362V17.824H113.674V23.512ZM131.242 37.84C131.242 34.768 130.378 32.368 128.65 30.64C126.97 28.864 124.882 27.976 122.386 27.976C119.938 27.976 117.85 28.864 116.122 30.64C114.442 32.416 113.602 34.84 113.602 37.912C113.602 40.984 114.442 43.408 116.122 45.184C117.85 46.96 119.938 47.848 122.386 47.848C124.834 47.848 126.922 46.96 128.65 45.184C130.378 43.36 131.242 40.912 131.242 37.84ZM162.542 58V4.72H150.23V58H162.542ZM209.542 37.9881C209.542 49.5795 200.363 58.9762 189.042 58.9762C177.72 58.9762 168.542 49.5795 168.542 37.9881C168.542 26.3967 177.72 17 189.042 17C191.771 17 194.375 17.546 196.757 18.5371C195.383 18.171 193.943 17.9762 192.458 17.9762C183.023 17.9762 175.375 25.8432 175.375 35.5476C175.375 45.2521 183.023 53.119 192.458 53.119C201.512 53.119 208.92 45.8751 209.505 36.7149C209.529 37.1361 209.542 37.5606 209.542 37.9881ZM178.218 30.1374C178.236 30.0723 178.254 30.0074 178.272 29.9427C178.361 32.2274 179.049 34.5517 180.384 36.6616C184.213 42.7123 191.913 44.709 197.583 41.1213C203.253 37.5337 204.746 29.7204 200.917 23.6697C200.076 22.3391 199.046 21.2044 197.893 20.2822C204.388 23.0721 207.992 30.4105 206.065 37.599C203.956 45.4719 196.012 50.1837 188.322 48.1233C180.633 46.0628 176.109 38.0103 178.218 30.1374ZM183.349 37.5853C186.622 39.4949 190.945 39.0021 193.811 36.1362C197.207 32.7404 197.271 27.2987 193.954 23.9819C190.637 20.665 185.196 20.729 181.8 24.1248C180.836 25.0888 180.14 26.2176 179.714 27.4158C180.887 25.9696 182.691 25.0081 184.747 24.9247C188.448 24.7746 191.566 27.5288 191.71 31.0764C191.854 34.6241 188.969 37.6217 185.268 37.7719C184.605 37.7987 183.961 37.7325 183.349 37.5853Z" fill="black"/>
                    </svg>
                    `,
                    fit: [150,50],
                    alignment: 'center'
                },
                {
                    canvas: [{ type: 'rect', x: 0, y: 0, w: 800 - 40, h: 2, color: 'black' }],
                    margin: [0, 16, 0, 32]
                },
                {
                    columns: [
                        {
                            width: '50%',
                            text: 'TANGGAL PEMBAYARAN',
                            bold: true
                        },
                        {
                            width: 'auto',
                            text: `: ${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}`
                        },
                    ],
                    fontSize: 16
                },
                {
                    text: '\n'
                },
                {
                    columns: [
                        {
                            width: '50%',
                            text: 'ID PELANGGAN',
                            bold: true
                        },
                        {
                            width: 'auto',
                            text: `: ${bill.idPelanggan}`
                        },
                    ],
                    fontSize: 16
                },
                {
                    columns: [
                        {
                            width: '50%',
                            text: 'NAMA PELANGGAN',
                            bold: true
                        },
                        {
                            width: 'auto',
                            text: `: ${bill.namaPelanggan}`
                        },
                    ],
                    fontSize: 16
                },
                {
                    columns: [
                        {
                            width: '50%',
                            text: 'ALAMAT',
                            bold: true
                        },
                        {
                            width: 'auto',
                            text: `: ${bill.alamat}`
                        },
                    ],
                    fontSize: 16
                },
                {
                    text: '\n'
                },
                {
                    columns: [
                        {
                            width: '50%',
                            text: 'PERIODE',
                            bold: true
                        },
                        {
                            width: 'auto',
                            text: `: ${bill.periode}`
                        },
                    ],
                    fontSize: 16
                },
                {
                    columns: [
                        {
                            width: '50%',
                            text: 'METERAN AWAL',
                            bold: true
                        },
                        {
                            width: 'auto',
                            text: `: ${bill.meteranAwal}m³`
                        },
                    ],
                    fontSize: 16
                },
                {
                    columns: [
                        {
                            width: '50%',
                            text: 'METERAN AKHIR',
                            bold: true
                        },
                        {
                            width: 'auto',
                            text: `: ${bill.meteranAkhir}m³`
                        },
                    ],
                    fontSize: 16
                },
                {
                    columns: [
                        {
                            width: '50%',
                            text: 'PENGGUNAAN AIR',
                            bold: true
                        },
                        {
                            width: 'auto',
                            text: `: ${bill.penggunaan}m³`
                        },
                    ],
                    fontSize: 16
                },
                {
                    text: '\n'
                },
                {
                    columns: [
                        {
                            width: '50%',
                            text: 'JUMLAH TAGIHAN',
                            bold: true
                        },
                        {
                            width: 'auto',
                            text: `: Rp ${(<number>bill.biaya).toLocaleString('de')}`
                        },
                    ],
                    fontSize: 16
                },
                {
                    columns: [
                        {
                            width: '50%',
                            text: 'DENDA',
                            bold: true
                        },
                        {
                            width: 'auto',
                            text: `: Rp ${(<number>bill.denda).toLocaleString('de')}`
                        },
                    ],
                    fontSize: 16
                },
                {
                    columns: [
                        {
                            width: '50%',
                            text: 'TOTAL TAGIHAN',
                            bold: true
                        },
                        {
                            width: 'auto',
                            text: `: Rp ${(<number>bill.biaya+<number>bill.denda).toLocaleString('de')}`
                        },
                    ],
                    fontSize: 16
                },
                {
                    text: 'Simpanlah struk ini sebagai bukti pembayaran Anda.\nTerima Kasih.',
                    fontSize: 16,
                    alignment: 'center',
                    margin: [0, 32],
                    pageBreak: 'after'
                }
            ]
            if(i===bills.length-1) delete billDef[billDef.length-1].pageBreak
            return billDef;
        })
    }

    const options = {
        // ...
    }

    const pdfDoc = printer.createPdfKitDocument(docDefinition, options);
    pdfDoc.pipe(pdfStream);
    pdfDoc.end();
    await (new Promise((resolve, _reject) => {
        pdfDoc.on('end', () => {
            resolve(1);
        })
    }));

    return Buffer.concat(bufs).toString('base64');
}