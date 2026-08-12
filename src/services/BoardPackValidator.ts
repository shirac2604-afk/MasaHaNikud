import { BoardPack, BoardPackValidationResult } from "../models/BoardPack";

export class BoardPackValidator {
    public validate(pack: BoardPack): BoardPackValidationResult {
        const errors: string[] = [];

        if (pack.schemaVersion !== 2) errors.push("גרסת מבנה חבילה אינה נתמכת");
        if (!pack.id?.trim()) errors.push("חסר מזהה לוח");
        if (pack.id && !/^[a-z0-9-]+$/.test(pack.id)) errors.push("מזהה הלוח חייב להכיל אותיות לטיניות קטנות, מספרים או מקף");
        if (!pack.name?.trim()) errors.push("חסר שם לוח");
        if (!pack.assetKey?.trim() || !pack.image?.trim()) errors.push("חסרה תמונת לוח");
        if (!pack.questionSet?.trim()) errors.push("חסרה ערכת שאלות");
        if (!Number.isInteger(pack.difficulty) || pack.difficulty < 1 || pack.difficulty > 5) {
            errors.push("רמת הקושי חייבת להיות מספר שלם בין 1 ל־5");
        }

        if (!pack.layout) {
            errors.push("חסרות הגדרות פריסת לוח");
        } else {
            if (pack.layout.referenceWidth <= 0 || pack.layout.referenceHeight <= 0) errors.push("ממדי הייחוס של הלוח אינם תקינים");
            if (pack.layout.tileRadius <= 0) errors.push("רדיוס המשבצת חייב להיות חיובי");
        }

        if (!Array.isArray(pack.path) || pack.path.length < 2) {
            errors.push("מסלול הלוח חייב להכיל לפחות שתי משבצות");
        } else {
            const ids = new Set<number>();
            pack.path.forEach((point, index) => {
                const label = `משבצת ${index + 1}`;
                if (!Number.isInteger(point.id) || point.id !== index + 1) errors.push(`${label}: המזהה חייב להיות רציף ולהתחיל ב־1`);
                if (ids.has(point.id)) errors.push(`${label}: מזהה כפול`);
                ids.add(point.id);
                this.validateCoordinate(point.center, `${label} - center`, errors);
                this.validateCoordinate(point.anchor, `${label} - anchor`, errors);
                if (!point.questionGroup?.trim()) errors.push(`${label}: חסר questionGroup`);
            });
        }

        const transitionStarts = new Set<number>();
        (pack.transitions ?? []).forEach((transition, index) => {
            const label = `מעבר ${index + 1}`;
            if (!Number.isInteger(transition.from) || !Number.isInteger(transition.to)) errors.push(`${label} מכיל מספר משבצת לא חוקי`);
            if (transition.from < 1 || transition.from > pack.path.length || transition.to < 1 || transition.to > pack.path.length) {
                errors.push(`${label} מצביע מחוץ למסלול`);
            }
            if (transition.from === transition.to) errors.push(`${label} מתחיל ומסתיים באותה משבצת`);
            if (transitionStarts.has(transition.from)) errors.push(`יותר ממעבר אחד מתחיל במשבצת ${transition.from}`);
            transitionStarts.add(transition.from);
            if (transition.kind === "ladder" && transition.to <= transition.from) errors.push(`${label}: סולם חייב לעלות`);
            if (transition.kind === "snake" && transition.to >= transition.from) errors.push(`${label}: נחש חייב לרדת`);
        });

        return { valid: errors.length === 0, errors };
    }

    private validateCoordinate(value: { x: number; y: number } | undefined, label: string, errors: string[]): void {
        if (!value || !Number.isFinite(value.x) || !Number.isFinite(value.y) || value.x < 0 || value.x > 1 || value.y < 0 || value.y > 1) {
            errors.push(`${label} נמצא מחוץ לטווח התקין`);
        }
    }
}
