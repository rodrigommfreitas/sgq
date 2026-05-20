import { SingletonDocumentPage } from "@/components/singleton-document-page";
import { getSystemPolicy, updateSystemPolicy, uploadSystemPolicyDocument } from "@/api/core";

export default function SystemPolicyPage() {
  return (
    <SingletonDocumentPage
      title="5.2. Política do Sistema e sua Divulgação"
      descriptionLabel="Política da Qualidade"
      descriptionPlaceholder="Descreva a política da qualidade..."
      emptyDescriptionText={'Nenhuma política definida. Clique em "Editar" para adicionar.'}
      documentCardTitle="Estado do Documento"
      queryKey={["system-policy"]}
      fetchFn={getSystemPolicy}
      updateFn={updateSystemPolicy}
      uploadFn={uploadSystemPolicyDocument}
    />
  );
}