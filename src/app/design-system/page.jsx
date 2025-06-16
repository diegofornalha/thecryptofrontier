import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { H1, H2, H3, H4, Paragraph, Lead, Subtle, Blockquote, Code } from "@/components/ui/typography";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";
export const metadata = {
    title: "Design System",
    description: "Guia de estilo e componentes do The Crypto Frontier",
};
export default function DesignSystemPage() {
    return (<Container>
      <div className="py-10 space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <H1>Design System</H1>
            <Lead>
              Guia de componentes e estilos para o The Crypto Frontier
            </Lead>
            <div className="mt-4">
              <Link href="/design-system/migracao" className="text-primary hover:underline">
                Ver plano de migração →
              </Link>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <div className="space-y-10">
          <section id="cores" className="space-y-4">
            <H2>Cores</H2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <ColorCard name="Background" variable="--background"/>
              <ColorCard name="Foreground" variable="--foreground"/>
              <ColorCard name="Primary" variable="--primary"/>
              <ColorCard name="Secondary" variable="--secondary"/>
              <ColorCard name="Muted" variable="--muted"/>
              <ColorCard name="Accent" variable="--accent"/>
              <ColorCard name="Card" variable="--card"/>
              <ColorCard name="Destructive" variable="--destructive"/>
              <ColorCard name="Border" variable="--border"/>
              <ColorCard name="Dark" variable="--dark"/>
              <ColorCard name="Light" variable="--light"/>
              <ColorCard name="Neutral" variable="--neutral"/>
            </div>
          </section>

          <section id="tipografia" className="space-y-4">
            <H2>Tipografia</H2>
            <Card>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <H1>Heading 1</H1>
                  <Subtle>Font Roboto Slab, text-4xl, font-bold</Subtle>
                </div>
                <div>
                  <H2>Heading 2</H2>
                  <Subtle>Font Roboto Slab, text-3xl, font-bold</Subtle>
                </div>
                <div>
                  <H3>Heading 3</H3>
                  <Subtle>Font Roboto Slab, text-2xl, font-bold</Subtle>
                </div>
                <div>
                  <H4>Heading 4</H4>
                  <Subtle>Font Roboto Slab, text-xl, font-bold</Subtle>
                </div>
                <div>
                  <Paragraph>
                    Parágrafo normal com texto em fonte Inter. Lorem ipsum dolor sit amet, 
                    consectetur adipiscing elit. Nulla facilisi. Maecenas in velit eget 
                    magna feugiat finibus.
                  </Paragraph>
                  <Subtle>Font Inter, text-base, leading-7</Subtle>
                </div>
                <div>
                  <Lead>
                    Lead text para introduções de seções, com um tamanho maior.
                  </Lead>
                  <Subtle>Font Inter, text-xl, text-muted-foreground</Subtle>
                </div>
                <div>
                  <Blockquote>
                    Uma citação importante para destacar no conteúdo.
                  </Blockquote>
                  <Subtle>Font Inter, border-l-2 border-primary, pl-6, italic</Subtle>
                </div>
                <div>
                  <Paragraph>
                    Use o componente <Code>Code</Code> para destacar código inline.
                  </Paragraph>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="botoes" className="space-y-4">
            <H2>Botões</H2>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <Button variant="default">Default</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="tema" className="space-y-4">
            <H2>Alternador de Tema</H2>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                  <Paragraph>Clique no botão para alternar entre os temas claro e escuro.</Paragraph>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="cards" className="space-y-4">
            <H2>Cards</H2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>Card Description</CardDescription>
                </CardHeader>
                <CardContent>
                  <Paragraph>Conteúdo do card com informações relevantes.</Paragraph>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="ghost">Cancelar</Button>
                  <Button>Salvar</Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Exemplo de Card</CardTitle>
                  <CardDescription>Demonstração dos componentes do card</CardDescription>
                </CardHeader>
                <CardContent>
                  <Paragraph>
                    Cards podem ser usados para agrupar informações relacionadas e
                    criar hierarquia visual no layout.
                  </Paragraph>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Ação Principal</Button>
                </CardFooter>
              </Card>
            </div>
          </section>

          <section id="containers" className="space-y-4">
            <H2>Containers</H2>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Container Default</CardTitle>
                  <CardDescription>max-w-screen-xl</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border border-dashed border-primary rounded-lg text-center">
                    Container padrão com largura máxima de 1280px
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Container Small</CardTitle>
                  <CardDescription>max-w-screen-md</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border border-dashed border-primary rounded-lg text-center">
                    Container pequeno com largura máxima de 768px
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Container Large</CardTitle>
                  <CardDescription>max-w-screen-2xl</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border border-dashed border-primary rounded-lg text-center">
                    Container grande com largura máxima de 1536px
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </Container>);
}
function ColorCard({ name, variable }) {
    const cssVar = `hsl(var(${variable}))`;
    return (<div className="flex flex-col">
      <div className="w-full h-24 rounded-md border" style={{ background: cssVar }}/>
      <div className="mt-2">
        <div className="font-medium">{name}</div>
        <div className="text-sm text-muted-foreground">{variable}</div>
      </div>
    </div>);
}
