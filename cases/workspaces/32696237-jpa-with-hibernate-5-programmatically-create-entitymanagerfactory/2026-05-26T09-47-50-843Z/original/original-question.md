# JPA with Hibernate 5: programmatically create EntityManagerFactory

Source: https://stackoverflow.com/questions/32696237/jpa-with-hibernate-5-programmatically-create-entitymanagerfactory

- Posted: 2015-09-21
- Score: 10
- Views: 7631
- Answers: 2
- Cold signal: Answers exist; top score 0
- Tags: `java` `hibernate` `jpa` `hibernate-entitymanager` `hibernate-5.x`

## Preserved Case Text

This question is specifically about programmatically creating a JPA EntityManagerFactory backed by Hibernate 5, meaning without configuration xml files and without using Spring.  Also, this question is specifically about creating an EntityManagerFactory with a Hibernate Interceptor.

I know how to create a Hibernate SessionFactory the way I want, but I do not want a Hibernate SessionFactory, I want a JPA EntityManagerFactory backed by a Hibernate SessionFactory.  Given an EntityManagerFactory there is a way to obtain the underlying SessionFactory, but if what you have is a SessionFactory and all you want is an EntityManagerFactory wrapper around it, it appears that you are out of luck.

With Hibernate version 4.2.2 Ejb3Configuration was already deprecated, but there seemed to be no other way to programmatically create an EntityManagerFactory, so I was doing something like this:

@SuppressWarnings( "deprecation" )
EntityManagerFactory buildEntityManagerFactory(
        UnmodifiableMap<String,String> properties,
        UnmodifiableCollection<Class<?>> annotatedClasses,
        Interceptor interceptor )
{
    Ejb3Configuration cfg = new Ejb3Configuration();
    for( Binding<String,String> binding : properties )
        cfg.setProperty( binding.key, binding.value );
    for( Class<?> annotatedClass : annotatedClasses )
        cfg.addAnnotatedClass( annotatedClass );
    cfg.setInterceptor( interceptor );
    return cfg.buildEntityManagerFactory();
}

With Hibernate 4.3.0 Ejb3Configuration was removed, so I had to make use of this hack:

EntityManagerFactory buildEntityManagerFactory(
        UnmodifiableMap<String,String> properties,
        UnmodifiableCollection<Class<?>> annotatedClasses,
        Interceptor interceptor )
{
    Configuration cfg = new Configuration();
    for( Binding<String,String> binding : properties )
        cfg.setProperty( binding.key, binding.value );
    for( Class<?> annotatedClass : annotatedClasses )
        cfg.addAnnotatedClass( annotatedClass );
    cfg.setInterceptor( interceptor );
    StandardServiceRegistryBuilder ssrb = new StandardServiceRegistryBuilder();
    ssrb.applySettings( cfg.getProperties() ); //??? why again?
    ServiceRegistry serviceRegistry = ssrb.build();
    return new EntityManagerFactoryImpl( PersistenceUnitTransactionType.RESOURCE_LOCAL, /**/
            /*discardOnClose=*/true, /*sessionInterceptorClass=*/null, /**/
            cfg, serviceRegistry, null );
}

(It is a hack because I am instantiating EntityManagerFactoryImpl which is in package org.hibernate.jpa.internal.)

Now, with Hibernate 5 they have changed the constructor of EntityManagerFactoryImpl, so the above code does not work.  I can waste a few hours trying to figure out how to set things up so that I can invoke that constructor, but I am sure that after a couple of Hibernate versions, that won't work anymore, either.

So, this is my question:

Does anybody know of a nice and clean way of implementing this function

EntityManagerFactory buildEntityManagerFactory(
        UnmodifiableMap<String,String> properties,
        UnmodifiableCollection<Class<?>> annotatedClasses,
        Interceptor interceptor )

so as to create a Hibernate EntityManagerFactory programmatically, meaning without configuration xml files and without using Spring but with a Hibernate Interceptor ?

There is this old question: Hibernate create JPA EntityManagerFactory with out persistence.xml but it has an answer for an older version of Hibernate, which has already been anticipated in this question.  That won't do, because I want it to work with Hibernate 5, and ideally, in a way which does not use anything deprecated or internal, so as to have some chances of working for a long time to come.

## Expected Evidence

Executable test or integration harness showing the original behavior and the fixed behavior.

## Risk Hints

- No unusual risk hints detected from tags/title.
