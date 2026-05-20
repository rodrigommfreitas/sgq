import { SingletonDocumentPage } from "@/components/singleton-document-page";
import { getResponsibilityAuthority, updateResponsibilityAuthority, uploadResponsibilityAuthorityDocument } from "@/api/core";

export default function ResponsibilityAuthorityPage() {
  return (
    <SingletonDocumentPage
      title="5.3. Atribuições, Responsabilidades e Autoridades"
      descriptionLabel="Atribuições, Responsabilidades e Autoridades"
      descriptionPlaceholder="Descreva as atribuições, responsabilidades e autoridades..."
      emptyDescriptionText={'Nenhuma definição registada. Clique em "Editar" para adicionar.'}
      documentCardTitle="Estado do Documento"
      queryKey={["responsibility-authority"]}
      fetchFn={getResponsibilityAuthority}
      updateFn={updateResponsibilityAuthority}
      uploadFn={uploadResponsibilityAuthorityDocument}
    />
  );
}