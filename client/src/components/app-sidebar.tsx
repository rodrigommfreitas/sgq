"use client";

import {
  Activity,
  Users,
  Maximize,
  GitBranch,
  UserCheck,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Target,
  RefreshCw,
  User2,
  Building2,
  Zap,
  BookOpen,
  GraduationCap,
  Lightbulb,
  MessageSquare,
  FileStack,
  Calendar,
  Truck,
  PencilRuler,
  Settings,
  ClipboardCheck,
  CheckCircle2,
  Gauge,
  Smile,
  Search,
  ClipboardList,
  Info,
  AlertTriangle,
  TrendingUp,
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
} from "lucide-react";

import { NavUser } from "@/components/nav-user";
import { NavTitle } from "@/components/nav-title.tsx";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth-context.tsx";
import { Link } from "react-router-dom";

// This is sample data.
const data = {
  teams: [
    {
      name: "SGQ - ISO 9001",
      logo: GalleryVerticalEnd,
      plan: "Universidade da Madeira",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavTitle teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>4. Contexto da Organização</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="4.1. Análise SWOT">
                <Link to="#">
                  <Activity />
                  <span>4.1. Análise SWOT</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="4.2. Partes Interessadas">
                <Link to="/partes-interessadas">
                  <Users />
                  <span>4.2. Partes Interessadas</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="4.3. Âmbito">
                <Link to="/ambito">
                  <Maximize />
                  <span>4.3. Âmbito</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="4.4. Diagrama de Macro Processos">
                <Link to="/processos">
                  <GitBranch />
                  <span>4.4. Diagrama de Macro Processos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>5. Liderança</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="5.1. Liderança e Compromisso">
                <Link to="/lideranca-compromisso">
                  <UserCheck />
                  <span>5.1. Liderança e Compromisso</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="5.2. Política do Sistema e sua Divulgação">
                <Link to="/politica-sg">
                  <FileText />
                  <span>5.2. Política do Sistema e sua Divulgação</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="5.3. Atribuições, Responsabilidades e Autoridades"
              >
                <Link to="/atribuicoes-responsabilidades">
                  <ShieldCheck />
                  <span>5.3. Atribuições, Responsabilidades e Autoridades</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>6. Planeamento</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="6.1. Riscos e Oportunidades">
                <Link to="#">
                  <ShieldAlert />
                  <span>6.1. Riscos e Oportunidades</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="6.2. Objetivos do SG">
                <Link to="#">
                  <Target />
                  <span>6.2. Objetivos do SG</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="6.3. Alterações">
                <Link to="/alteracoes">
                  <RefreshCw />
                  <span>6.3. Alterações</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>7. Suporte</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="7.1.2. Recursos - Pessoas">
                <Link to="#">
                  <User2 />
                  <span>7.1.2. Recursos - Pessoas</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="7.1.3. Recursos - Infraestruturas e Ambiente">
                <Link to="#">
                  <Building2 />
                  <span>7.1.3. Recursos - Infraestruturas e Ambiente</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="7.1.5. Recursos - EMM">
                <Link to="#">
                  <Zap />
                  <span>7.1.5. Recursos - EMM</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="7.1.6. Recursos - Conhecimento Organizacional">
                <Link to="#">
                  <BookOpen />
                  <span>7.1.6. Recursos - Conhecimento Organizacional</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="7.2. Competências">
                <Link to="#">
                  <GraduationCap />
                  <span>7.2. Competências</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="7.3. Consciencialização">
                <Link to="/consciencializacao">
                  <Lightbulb />
                  <span>7.3. Consciencialização</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="7.4. Comunicação">
                <Link to="#">
                  <MessageSquare />
                  <span>7.4. Comunicação</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="7.5. Informação Documentada">
                <Link to="#">
                  <FileStack />
                  <span>7.5. Informação Documentada</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>8. Operacionalização</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="8.1. Planeamento">
                <Link to="#">
                  <Calendar />
                  <span>8.1. Planeamento</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="8.2. Comunicação de produtos e serviços">
                <Link to="#">
                  <Truck />
                  <span>8.2. Comunicação de produtos e serviços</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="8.3. Design e Desenvolvimento">
                <Link to="#">
                  <PencilRuler />
                  <span>8.3. Design e Desenvolvimento</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="8.4. Operacionalização">
                <Link to="#">
                  <Settings />
                  <span>8.4. Operacionalização</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="8.5. Controlo dos Cursos">
                <Link to="#">
                  <ClipboardCheck />
                  <span>8.5. Controlo dos Cursos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="8.6. Libertação (aprovação)">
                <Link to="#">
                  <CheckCircle2 />
                  <span>8.6. Libertação (aprovação)</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>9. Avaliação de desempenho</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="9.1. Indicadores de Desempenho">
                <Link to="/indicadores">
                  <Gauge />
                  <span>9.1. Indicadores de Desempenho</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="9.1.2. Satisfação dos Estudantes">
                <Link to="#">
                  <Smile />
                  <span>9.1.2. Satisfação dos Estudantes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="9.2. Auditorias">
                <Link to="#">
                  <Search />
                  <span>9.2. Auditorias</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="9.3. Revisão pela Gestão">
                <Link to="#">
                  <ClipboardList />
                  <span>9.3. Revisão pela Gestão</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>10. Melhoria</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="10.1. Generalidades">
                <Link to="#">
                  <Info />
                  <span>10.1. Generalidades</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="10.2. Tratamento de Não Conformidades">
                <Link to="/non-conformities">
                  <AlertTriangle />
                  <span>10.2. Tratamento de Não Conformidades</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="10.3. Reclamações e Oportunidades de Melhoria">
                <Link to="#">
                  <TrendingUp />
                  <span>10.3. Reclamações e Oportunidades de Melhoria</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-slate-200">
        <NavUser user={user!} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
