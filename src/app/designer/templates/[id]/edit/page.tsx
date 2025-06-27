// src/app/designer/templates/[id]/edit/page.tsx

import Designer from "@/components/designer/Designer";
import { prisma } from "@/lib/prisma";

async function getTemplate(id: string) {
    const template = await prisma.labelTemplate.findUnique({
        where: { id },
    });
    return template;
}

export default async function EditTemplatePage({ params }: { params: { id: string } }) {
    const template = await getTemplate(params.id);

    if (!template) {
        return <div>Template not found.</div>
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Editing: {template.name}</h1>
            {/* Pasamos la plantilla guardada como prop al diseñador */}
            <Designer existingTemplate={template} />
        </div>
    );
}