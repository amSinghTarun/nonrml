export const escapeHtml = (text: string): string => {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    if(text)
        return text.replace(/[&<>"']/g, (m) => map[m]!);
    return ""
};

export const logoSrc = 'https://kgvmjizuinwaxkfkvidy.supabase.co/storage/v1/object/public/images/company/NoNRML_FINAL.png';

export const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
};