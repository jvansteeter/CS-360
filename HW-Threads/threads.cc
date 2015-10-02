// C includes
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <time.h>
#include <iostream>

#include <semaphore.h>

using namespace std;

struct data_ {
    int value;
    sem_t lock, signal;
    /*
    pthread_mutex_t mutex;
    pthread_cond_t cond;

    bool written;
    */
};

void *store(void *);
void *read(void *);

int
main(int argc, char **argv)
{
    pthread_t tidA, tidB;
    // counter in shared memory
    struct data_ stdata;

    // initialize mutex
    /*pthread_mutex_init(&data.mutex, NULL);
    pthread_cond_init(&data.cond, NULL);*/
    //data.cond = PTHREAD_COND_INITIALIZER;

    sem_init(&data.lock,0,1);
    sem_init(&data.signal, 0, 0);

    data.value = 0;
    //data.written = false;
    srandom(time(NULL));

    // create two threads
    pthread_create(&tidA, NULL, &store, &data);
    pthread_create(&tidB, NULL, &read, &data);

    // wait for both threads to terminate
    pthread_join(tidA, NULL);
    pthread_join(tidB, NULL);
  
    exit(0);
}

void *
store(void *vptr)
{
    int i, val;
    long r;
    struct data_* data;

    data = (struct data_*) vptr;
    r = rand() % 100;
    sem_wait(&data->lock);
    //pthread_mutex_lock(&data->mutex);
    data->value = r;
    //data->written = true;
    //pthread_mutex_unlock(&data->mutex);
    cout << "Storing " << r << endl;

    sem_post(&data->lock);
    sem_post(&data->signal);
    //pthread_cond_signal(&data->cond);
    //pthread_mutex_unlock(&data->mutex);
}

void*
read(void *vptr)
{
    

    struct data_* data;
    data = (struct data_*) vptr;

    sem_wait(&data->signal);
    sem_wait(&data->lock);
    cout << "Reading " << data->value << endl;
    sem_post(&data->lock);
    /*
    pthread_mutex_lock(&data->mutex);
    while(data->written == false)
    {
        pthread_cond_wait(&data->cond, &data->mutex);
    }
    cout << "Reading " << data->value << endl;
    pthread_mutex_unlock(&data->mutex);
    */
}