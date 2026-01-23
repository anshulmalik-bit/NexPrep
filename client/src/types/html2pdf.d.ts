declare module 'html2pdf.js' {
    interface Html2PdfOptions {
        margin?: number | number[];
        filename?: string;
        image?: { type?: 'jpeg' | 'png' | 'webp'; quality?: number };
        html2canvas?: { scale?: number; useCORS?: boolean; logging?: boolean };
        jsPDF?: { unit?: string; format?: string; orientation?: 'portrait' | 'landscape' };
        pagebreak?: { mode?: string | string[] };
    }

    interface Html2Pdf {
        set(opt: Html2PdfOptions): Html2Pdf;
        from(element: HTMLElement | string): Html2Pdf;
        save(): Promise<void>;
        toPdf(): Html2Pdf;
        output(type: string, options?: any): Promise<any>;
    }

    function html2pdf(): Html2Pdf;
    export default html2pdf;
}
