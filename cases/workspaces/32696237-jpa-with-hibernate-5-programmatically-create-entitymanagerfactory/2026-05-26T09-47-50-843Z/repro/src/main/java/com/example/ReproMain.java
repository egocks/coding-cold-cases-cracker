package com.example;

import org.hibernate.cfg.Configuration;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.hibernate.service.ServiceRegistry;
import org.hibernate.jpa.internal.EntityManagerFactoryImpl;
import javax.persistence.EntityManagerFactory;
import javax.persistence.spi.PersistenceUnitTransactionType;

/**
 * Reproduces SO #32696237:
 * The Hibernate 4.3 hack of directly instantiating EntityManagerFactoryImpl
 * breaks in Hibernate 5 because the constructor signature changed.
 *
 * In Hibernate 4.3 the constructor was:
 *   EntityManagerFactoryImpl(PersistenceUnitTransactionType, boolean,
 *       Class<? extends Interceptor>, Configuration, ServiceRegistry, String)
 *
 * In Hibernate 5.0 that constructor no longer exists in the same form,
 * so this code fails to compile / throws at runtime.
 */
public class ReproMain {

    public static void main(String[] args) throws Exception {
        Configuration cfg = new Configuration();
        cfg.setProperty("hibernate.connection.driver_class", "org.h2.Driver");
        cfg.setProperty("hibernate.connection.url", "jdbc:h2:mem:repro;DB_CLOSE_DELAY=-1");
        cfg.setProperty("hibernate.dialect", "org.hibernate.dialect.H2Dialect");
        cfg.setProperty("hibernate.hbm2ddl.auto", "create-drop");
        cfg.addAnnotatedClass(Item.class);

        StandardServiceRegistryBuilder ssrb = new StandardServiceRegistryBuilder();
        ssrb.applySettings(cfg.getProperties());
        ServiceRegistry serviceRegistry = ssrb.build();

        // ---- THE HACK FROM HIBERNATE 4.3 ----
        // This constructor no longer exists in Hibernate 5; compilation fails.
        EntityManagerFactory emf = new EntityManagerFactoryImpl(
                PersistenceUnitTransactionType.RESOURCE_LOCAL,
                /*discardOnClose=*/ true,
                /*sessionInterceptorClass=*/ null,
                cfg,
                serviceRegistry,
                null
        );

        System.out.println("EntityManagerFactory created: " + emf);
        emf.close();
    }
}
