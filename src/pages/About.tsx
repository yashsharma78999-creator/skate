import { Snowflake, Target, Users, Award } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
const stats = [{
  label: "Happy Skaters",
  value: "10K+",
  icon: Users
}, {
  label: "Products Sold",
  value: "50K+",
  icon: Snowflake
}, {
  label: "Countries",
  value: "80+",
  icon: Target
}, {
  label: "Awards Won",
  value: "12",
  icon: Award
}];
const values = [{
  title: "Authenticity",
  description: "Every product we sell is 100% genuine, sourced directly from official manufacturers and partners."
}, {
  title: "Quality",
  description: "We curate only the finest skating gear that meets professional standards for performance and durability."
}, {
  title: "Passion",
  description: "Our team lives and breathes ice skating. We understand what skaters need because we're skaters ourselves."
}, {
  title: "Community",
  description: "We're building more than a store - we're fostering a global community of skating enthusiasts."
}];
const About = () => {
  return <Layout>
      {/* Hero */}
      <section className="bg-primary py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
            About <span className="text-accent">Skating</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-3xl mx-auto">
            Born from a passion for ice skating, we're dedicated to bringing 
            world-class skating gear to athletes and enthusiasts everywhere.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-secondary border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(stat => <div key={stat.label} className="text-center">
                <stat.icon className="w-8 h-8 mx-auto text-accent mb-3" />
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-primary-foreground">{stat.label}</div>
              </div>)}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Skating started in 2020 with a simple mission: make professional-grade
                  ice skating equipment accessible to everyone who loves the sport.
                </p>
                <p>
                  What began as a small online store run by former competitive skaters has grown into 
                  a trusted destination for authentic skating gear. We've partnered with 
                  the world's leading brands to bring you the same equipment used by 
                  Olympic champions and professional athletes.
                </p>
                <p>
                  Today, we serve over 10,000 customers across 80+ countries, united by 
                  a shared love for ice skating. Whether you're a figure skater, hockey player, or 
                  recreational skater, we've got everything you need to glide with confidence.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
                <Snowflake className="w-24 h-24 text-accent" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-accent text-accent-foreground px-6 py-4 rounded-xl shadow-lg">
                <div className="text-2xl font-bold">Since 2020</div>
                <div className="text-sm opacity-80">Serving Skaters Worldwide</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do at Skating.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => <div key={value.title} className="p-6 rounded-xl border border-border hover:shadow-lg transition-shadow bg-primary-foreground">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-card-foreground mb-2">
                      {value.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-zinc-950">
                      {value.description}
                    </p>
                  </div>
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Gear Up?
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Explore our collection of authentic skating gear and find everything you need to perform like a champion.
          </p>
          <Link to="/store">
            <Button variant="gold" size="xl">
              Shop Now
            </Button>
          </Link>
        </div>
      </section>
    </Layout>;
};
export default About;
