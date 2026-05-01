FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

FROM mcr.microsoft.com/playwright/java:v1.49.0-noble
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

RUN mkdir -p /dev/shm && chmod 777 /dev/shm

EXPOSE 8080
ENV JAVA_OPTS="-Xmx256m -Xms128m -XX:+UseSerialGC -XX:MaxMetaspaceSize=128m -Xss512k"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
