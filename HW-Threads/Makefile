CXX=		g++ $(CCFLAGS)
THREADS=	threads.o
OBJS =		$(EXAMPLE) 

LIBS=		-pthread

CCFLAGS= -g

all:		threads

threads:	$(THREADS)
		$(CXX) -o threads $(THREADS) $(LIBS)

clean:
		rm -f $(OBJS) $(OBJS:.o=.d)

realclean:
		rm -f $(OBJS) $(OBJS:.o=.d) example problem semaphore mutex


# These lines ensure that dependencies are handled automatically.
%.d:	%.cc
	$(SHELL) -ec '$(CC) -M $(CPPFLAGS) $< \
		| sed '\''s/\($*\)\.o[ :]*/\1.o $@ : /g'\'' > $@; \
		[ -s $@ ] || rm -f $@'

include	$(OBJS:.o=.d)
